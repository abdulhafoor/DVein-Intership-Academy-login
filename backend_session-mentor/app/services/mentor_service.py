from app.schemas.mentor import ChatRequest


class MentorService:

    @staticmethod
    def chat(data: ChatRequest):

        responses = [
            "That's a great question! Let me explain...",
            "Based on your progress, I recommend learning React Hooks.",
            "Keep practicing. You're doing well.",
            "Try solving two React projects this week.",
            "Would you like an example?",
            "Let's break this topic into smaller parts."
        ]

        return {
            "response": responses[0]
        }

    @staticmethod
    def progress():

        return {
            "currentTopic": "React Basics",
            "progressPercentage": 65,
            "completedTopics": [
                "HTML & CSS",
                "JavaScript Fundamentals"
            ],
            "topics": [
                "React Basics",
                "JavaScript ES6",
                "Web APIs"
            ]
        }

    @staticmethod
    def assessments():

        return [
            {
                "id": 1,
                "title": "JavaScript Quiz",
                "score": 85,
                "totalScore": 100,
                "date": "2026-07-03",
                "status": "completed"
            },
            {
                "id": 2,
                "title": "React Basics Quiz",
                "score": 0,
                "totalScore": 100,
                "date": "2026-07-05",
                "status": "pending"
            }
        ]

    @staticmethod
    def recommendations():

        return [
            {
                "id": 1,
                "type": "Course",
                "title": "Advanced React Patterns",
                "description": "Learn Hooks, Context API and Optimization",
                "level": "Intermediate",
                "duration": "8 weeks"
            },
            {
                "id": 2,
                "type": "Practice",
                "title": "Build a Todo App",
                "description": "Practice your React skills",
                "level": "Beginner",
                "duration": "2 Hours"
            }
        ]

    @staticmethod
    def submit_assessment(id: int):

        return {
            "message": f"Assessment {id} submitted successfully.",
            "score": 85
        }