const formStyles = {
  overlay : {
    position        : 'fixed',
    top             : 0,
    left            : 0,
    right           : 0,
    bottom          : 0,
    backgroundColor : 'rgba(211, 211, 211, 0.75)',
    zIndex          : 10,
    overflowY       : 'auto',
  },

  content : {
    position: 'absolute',
    width           : '500px',
    maxWidth        : 'calc(100vw - 40px)',
    maxHeight       : 'calc(100vh - 40px)',
    top             : '50%',
    left            : '50%',
    right           : 'auto',
    padding         : '20px',
    bottom          : 'auto',
    border          : '1px solid #C0C0C0',
    borderRadius    : '4px',
    transform       : 'translate(-50%, -50%)',
    zIndex          : 11,
    fontFamily      : 'Muli',
    boxSizing       : 'border-box',
    overflowY       : 'auto',
  }
};

export default formStyles;
