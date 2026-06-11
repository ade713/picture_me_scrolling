import Modal from 'react-modal';

export const setupModalAppElement = () => {
  const appElement = document.createElement('div');
  appElement.id = 'react-modal-app-root';
  document.body.appendChild(appElement);
  Modal.setAppElement(appElement);

  return () => {
    appElement.remove();
  };
};
