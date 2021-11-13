import './../assets/styles/resultsCheckboxes.scss'

export const ResultsCheckboxes = (props) => {
    return (
        <div className="result-checkboxes-div">
            {
                props.checkboxes.map((item, index) => (
                    <div key={index} className="detail-item">
                        <input type='checkbox' checked />
                        <label className="checkbox-label">{item}</label>
                    </div>
                ))
            }
        </div>
    )
}