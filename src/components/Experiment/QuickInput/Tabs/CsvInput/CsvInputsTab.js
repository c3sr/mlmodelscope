import React, { useState, useEffect } from 'react';

import useBEMNaming from "../../../../../common/useBEMNaming";
import Task from '../../../../../helpers/Task';
import CsvIcon from "../../../../../resources/icons/icon-csv-file.svg";

import "./CsvInputsTab.scss";

const csvHeaders = ["a", "b", "c", "d", "e", "f"];
const emptyCsv = [
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
];
const emptyCsvString = ',,,,,\n,,,,,\n,,,,,\n,,,,,\n,,,,,\n,,,,,';

export default function CsvInputsTab(props) {
    const task = Task.getStaticTask(props.task);

    const { getElement, getBlock } = useBEMNaming('csv-inputs');

    const taskName = (task.useMultiInput ? (task.inputs[props.inputIndex]?.inputType) : task.inputType || '').toLowerCase();
    // Note: Currently using both new and old way of handling inputs but should refactor in the future
    const inputText = task.inputText || props.input.inputText;
    
    const [csvData, setCsvData] = useState(emptyCsv);

    useEffect(() => {
        const csvString = stringifyCsvData();
        if (csvString !== emptyCsvString) {
            props.inputSelected(csvString, props.inputIndex);
        }
    }, [csvData])    

    const updateCell = (event, rowIndex, colIndex) => {
        if (event.persist)
            event.persist();

        let csvCopy =[...csvData];
        csvCopy[rowIndex][colIndex] = event.target.value;
        setCsvData(csvCopy);
    }

    const stringifyCsvData = () => {
        return csvData.map((row) => row.join(',')).join('\n');
    }

    const downloadCsv = () => {
        const fileType = 'text/csv';
        const fileName = 'text-input.csv';
        const csvString = stringifyCsvData();
        const blob = new Blob([csvString], { type: fileType });

        let a = document.createElement('a');
        a.download = fileName;
        a.href = URL.createObjectURL(blob);
        a.dataset.downloadurl = [fileType, a.download, a.href].join(':');
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function() { URL.revokeObjectURL(a.href); }, 1500);
    }

    return (
        <div className={getBlock()}>
            <div className={getElement('title')}>
                <b>Manually enter {taskName} contents</b>
                {" "}to {inputText.toLowerCase()}
            </div>
            <div className={getElement('container')}>
                <div className={getElement('csv-header')}>
                    { csvHeaders.map((header) => {
                        return (
                            <div className={getElement('col-header')} key={`row-header-${header}`}>
                                {header}
                            </div>
                        )
                    })}
                </div>
                <div className={getElement('table')}>
                    { csvData.map((row, rowIndex) => {
                        return (
                            <div className={getElement('row')} key={`row-${rowIndex}`}>
                                <p className={getElement('row-label')}>
                                    {rowIndex}
                                </p>

                                { row.map((cell, colIndex) => {
                                    return (
                                        <div className={getElement('cell')} key={`cell-${rowIndex}-${colIndex}`}>
                                            <input
                                                className={getElement('text-input')}
                                                type="text"
                                                value={cell}
                                                onChange={(event) => (updateCell(event, rowIndex, colIndex))}
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                        )
                    })}
                </div>
                <div>
                    <button 
                        disabled={csvData === emptyCsv}
                        className={getElement('download-csv-button')}
                        onClick={() => downloadCsv()}>
                        <img src={CsvIcon} alt="download-csv-icon" />
                        <p>Download</p>
                    </button>            
                </div>
            </div>
        </div>
    )
}