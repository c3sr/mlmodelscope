import Modal from "../../Common/Modal/Modal";
import useBEMNaming from "../../../common/useBEMNaming";
import QuickInput from "../../Experiment/QuickInput/QuickInput";
import "./AddInputModal.scss";

export default function AddInputModal(props) {
  const { getElement } = useBEMNaming("add-input-modal");

  const onAdd = (urls) => {
    props.addInput(urls);
    props.close();
  };

  return (
    <Modal onCancel={props.close}>
      <p className={getElement("heading")}> Choose an input </p>
      <div className={getElement("input-wrapper")}>
        <QuickInput
          model={{ output: { type: props.task.id } }}
          hideHeader
          onRunModelClicked={onAdd}
          sampleInputs={props.sampleInputs}
        />
      </div>
    </Modal>
  );
}
