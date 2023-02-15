import QueryBuilder from "react-querybuilder"
import 'react-querybuilder/dist/query-builder.css';
import React from "react";

type Props = {
    fields: Array<any>
}
const FormEditor: React.FC<Props> = ({fields}) => {

    return <div>
        <QueryBuilder debugMode
                      
                      operators={[{name: 'in', label: 'in'},
                          {name: 'notIn', label: 'not in'}]} fields={fields}/>
    </div>
}
export default FormEditor