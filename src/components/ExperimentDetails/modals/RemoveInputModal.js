import React from 'react';
import {ConfirmationModal} from "../../Common/Modal/Modal";
import {ReactComponent as TrashIcon} from "../../../resources/icons/trash.svg";
import useBEMNaming from "../../../common/useBEMNaming";
import "./RemoveInputModal.scss"

export default function RemoveInputModal(props) {

  const {getElement} = useBEMNaming("remove-input-modal")

  return <ConfirmationModal icon={<TrashIcon/>} onCancel={props.close}>
    <h2 className={getElement("heading")}>
      You are about to remove this input
    </h2>
    <p className={getElement("text")}>This will delete all outputs created from this input.</p>
    <div className={getElement('controls')}>
      <button className={getElement('cancel')} onClick={props.close}>
        No, don’t remove
      </button>
      <button className={getElement('confirm')} onClick={props.deleteInput}>
        Yes, remove
      </button>
    </div>
  </ConfirmationModal>
}

