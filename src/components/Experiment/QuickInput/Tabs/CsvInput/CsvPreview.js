import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

import useBEMNaming from "../../../../../common/useBEMNaming";

import "./CsvPreview.scss";

const columnLimit = 10;
const rowLimit = 10;

export default function CsvPreview(props) {
    const csvUrl = props.url;

    const { getElement, getBlock } = useBEMNaming('csv-preview');

    const [csvHeaders, setCsvHeaders] = useState([]);
    const [csvData, setCsvData] = useState([]);
    const [rowsTruncated, setRowsTruncated] = useState(false);
    const [colsTruncated, setColsTruncated] = useState(false);

    const config = {
        header: true,
        download: true,
        dynamicTyping: true,
        preview: rowLimit,  // Only parse the first X rows of the csv file
        complete: (results) => {
            const { errors, meta, data } = results;
            const fields = meta.fields;

            setCsvHeaders(fields)
            setCsvData(data);   
            setRowsTruncated(meta.truncated);  // T/F depending on if config.preview was less than # of rows in the csv
            setColsTruncated(fields.length > columnLimit)    
            
            if (errors.length > 0) { 
                // Per PapaParse documentation, errors don't necessarily mean that parsing failed
                // https://www.papaparse.com/docs#errors
            }        
        }
    }    

    useEffect(() => {
        Papa.parse(csvUrl, config);
    }, []);

    return (
        <div className={getBlock()}>
            { (rowsTruncated || colsTruncated) && (
                <div className={getElement("warning")}>
                    <b>Note:&nbsp;</b>This table has been truncated. 
                        You can download the full file below.
                </div>
            )}
            <div className={getElement("table-container")}>
                { csvData.length > 0 ? (
                    <div className={getElement("table")}>
                        <div className={getElement("max-header")}>
                            <div className={getElement("header")}>
                                { csvHeaders.map((header, index) => {
                                    if (index < columnLimit) {
                                        return (
                                            <div className={getElement("cell")} key={`column-${index}`}>
                                                {header}
                                            </div>
                                        )
                                    }
                                })}
                            </div>
                        </div>
                        { csvData.map((item, rowIndex) => {
                            return (
                                <div className={getElement("row")} key={`row-${rowIndex}`}>
                                    { Object.entries(item).map(([key, val], colIndex) => {
                                        if (colIndex < columnLimit) {
                                            const cellText = !(val instanceof Date) ? val : val.toDateString();
                                            return (
                                                <div className={getElement("cell")} key={`column-${key}`}>
                                                    <div className={getElement("cell-text")}>
                                                        {cellText}
                                                    </div>
                                                    <div className={getElement("cell-tooltip")}>
                                                        <span className="tooltip-text">
                                                            {cellText}
                                                        </span>
                                                    </div>
                                                </div>
                                            )
                                        }})
                                    }
                                </div>
                            )
                        })}
                        { rowsTruncated && (
                            <div className={getElement("row")}>
                                <div className={getElement("truncated-row-cell")}>
                                    <b>...</b>
                                </div>
                                {[...Array(columnLimit - 1)].map((x, i) =>
                                    <div className={getElement("truncated-row-cell")} key={i} />
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        Loading csv data...
                    </div>
                )}
                { colsTruncated && (
                    <div className={getElement("truncated-table")}>
                        <div className={getElement("truncated-header")}>
                            <b>...</b>
                        </div>
                        {[...Array(rowLimit)].map((x, i) =>
                            <div className={getElement("truncated-col-cell")} key={i} />
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}