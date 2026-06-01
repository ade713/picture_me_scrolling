import React from 'react';

export const FormErrors = ({ errors }) => (
  <div className="form-errors">
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
      onClick={ onClose }>
      Close
    </button>
    <button
      className="post-submit-button"
      onClick={ onSubmit }
      disabled={ disabled } >
      { submitLabel }
    </button>
  </div>
);
