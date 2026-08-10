import React from 'react';

import { buttonLabels } from '../../config/button_labels';

export const FormErrors = ({ errors }) => {
  if (errors.length === 0) return null;

  return (
    <div className="form-errors" role="alert" aria-live="polite">
      <strong>
        <ul>
          { errors.map((error, index) => (
            <li key={ `error-${index}` }>
              { error }
            </li>
          )) }
        </ul>
      </strong>
    </div>
  );
};

export const ModalButtonFooter = ({
  disabled,
  onClose,
  onSubmit,
  submitLabel = buttonLabels.post
}) => (
  <div className="modal-button">
    <button
      className="form-button"
      type="button"
      onClick={ onClose }>
      {buttonLabels.close}
    </button>
    <button
      className="post-submit-button"
      type="button"
      onClick={ onSubmit }
      disabled={ disabled } >
      { submitLabel }
    </button>
  </div>
);
