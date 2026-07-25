import { useEffect, useRef } from 'react';

const GUEST_USER = {
  username: 'PicMeS Guest',
  password: '1Welcome2To3PicMeS'
};
const GUEST_LOGIN_TYPING_INTERVAL_MS = 75;
const GUEST_LOGIN_SUBMIT_DELAY_MS = 1700;

const useGuestLogin = ({ login, setUsername, setPassword }) => {
  const guestLoginTimers = useRef([]);

  useEffect(() => (
    () => {
      guestLoginTimers.current.forEach(clearTimeout);
    }
  ), []);

  const clearGuestLoginTimers = () => {
    guestLoginTimers.current.forEach(clearTimeout);
    guestLoginTimers.current = [];
  };

  const queueGuestLoginTimer = (callback, delay) => {
    const timerId = setTimeout(callback, delay);
    guestLoginTimers.current.push(timerId);
  };

  return e => {
    e.preventDefault();
    clearGuestLoginTimers();

    for (let i = 0; i < GUEST_USER.username.length; i++) {
      queueGuestLoginTimer(
        () => setUsername(GUEST_USER.username.slice(0, i + 1)),
        i * GUEST_LOGIN_TYPING_INTERVAL_MS
      );
    }

    for (let i = 0; i < GUEST_USER.password.length; i++) {
      queueGuestLoginTimer(
        () => setPassword(GUEST_USER.password.slice(0, i + 1)),
        (i + GUEST_USER.username.length) * GUEST_LOGIN_TYPING_INTERVAL_MS
      );
    }

    queueGuestLoginTimer(
      () => login.mutate(GUEST_USER),
      GUEST_LOGIN_SUBMIT_DELAY_MS
    );
  };
};

export default useGuestLogin;
