from datetime import datetime

from flask import Blueprint, request, jsonify, current_app

from app.extensions import db
from app.models.notification import Notification

notification_bp = Blueprint("notifications", __name__)


@notification_bp.route("", methods=["POST"])
def send_notification():
    """
    Matches `sendNotification({ message, recipient })` in the frontend.

    Body:
    {
        "message": "Week 6 assessment scores have been published.",
        "recipient": "Batch A"   // one of: All Interns, Batch A, Batch B, Batch C
    }
    """
    data = request.get_json(silent=True) or {}
    message = (data.get("message") or "").strip()
    recipient = data.get("recipient")

    if not message:
        return jsonify({"error": "message is required"}), 400

    valid_recipients = current_app.config["VALID_RECIPIENTS"]
    if recipient not in valid_recipients:
        return jsonify({"error": f"recipient must be one of {sorted(valid_recipients)}"}), 400

    notification = Notification(message=message, recipient=recipient, status="unread")
    db.session.add(notification)
    db.session.commit()

    return jsonify(notification.to_dict()), 201


@notification_bp.route("", methods=["GET"])
def list_notifications():
    """
    List notifications, most recent first.
    Query params: status ("unread"/"read"), recipient, page, per_page
    """
    query = Notification.query

    status = request.args.get("status")
    recipient = request.args.get("recipient")

    if status in ("unread", "read"):
        query = query.filter(Notification.status == status)
    if recipient:
        query = query.filter(Notification.recipient == recipient)

    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", 50, type=int), 200)

    query = query.order_by(Notification.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "notifications": [n.to_dict() for n in pagination.items],
        "total": pagination.total,
        "unreadCount": Notification.query.filter_by(status="unread").count(),
        "page": page,
        "per_page": per_page,
        "pages": pagination.pages,
    }), 200


@notification_bp.route("/unread-count", methods=["GET"])
def unread_count():
    count = Notification.query.filter_by(status="unread").count()
    return jsonify({"unreadCount": count}), 200


@notification_bp.route("/<int:notification_id>/read", methods=["PATCH"])
def mark_as_read(notification_id):
    """Matches the "Mark as read" button in the frontend."""
    notification = Notification.query.get(notification_id)
    if not notification:
        return jsonify({"error": "Notification not found"}), 404

    notification.status = "read"
    notification.read_at = datetime.utcnow()
    db.session.commit()

    return jsonify(notification.to_dict()), 200


@notification_bp.route("/read-all", methods=["PATCH"])
def mark_all_as_read():
    now = datetime.utcnow()
    updated = Notification.query.filter_by(status="unread").update(
        {"status": "read", "read_at": now}
    )
    db.session.commit()
    return jsonify({"updatedCount": updated}), 200


@notification_bp.route("/<int:notification_id>", methods=["DELETE"])
def delete_notification(notification_id):
    notification = Notification.query.get(notification_id)
    if not notification:
        return jsonify({"error": "Notification not found"}), 404

    db.session.delete(notification)
    db.session.commit()
    return jsonify({"message": "Notification deleted"}), 200
