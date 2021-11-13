import './../assets/styles/resultData.scss'

export const ResultsData = (props) => {
    return (
        <div className="result-data-div">
            {
                props.result.map((item, index) => (
                    <div key={index} className="detail-item">
                        <label>{item?.name}</label>
                        <label>{item?.value}</label>
                    </div>
                ))
            }
        </div>
    )
}