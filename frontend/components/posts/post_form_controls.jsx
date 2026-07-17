import React from 'react';

export const FormErrors = ({ errors }) => (
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

export const ModalButtonFooter = ({
  disabled,
  onClose,
  onSubmit,
  submitLabel = 'Post'
}) => (
  <div className="modal-button">
    <button
      className="form-button"
      type="button"
      onClick={ onClose }>
      Close
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
