import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

const cursorBall = document.createElement('div');
cursorBall.id = 'cursor-ball';
document.body.appendChild(cursorBall);

const cursorGlow = document.createElement('div');
cursorGlow.id = 'cursor-glow';
document.body.appendChild(cursorGlow);

window.addEventListener('mousemove', (event) => {
  cursorBall.style.left = `${event.clientX}px`;
  cursorBall.style.top = `${event.clientY}px`;
  cursorGlow.style.left = `${event.clientX}px`;
  cursorGlow.style.top = `${event.clientY}px`;
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
