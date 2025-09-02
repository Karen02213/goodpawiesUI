import React from 'react';
import Modal from './Modal';

const ModalContainer = ({ modals, onHideModal }) => {
  return (
    <>
      {modals.map((modal) => (
        <Modal
          key={modal.id}
          isOpen={true}
          onClose={() => onHideModal(modal.id)}
          {...modal}
        />
      ))}
    </>
  );
};

export default ModalContainer;
