import FormField from "../common/forms/FormField"
import TextEditor from "../common/forms/TextEditor"


interface Props {
    value: string
    onChange: (value: string) => void
    onFindRequested: (value: string) => void
}

export const ExchangeKeywordSearch:React.FC<Props> = ({ value, onChange, onFindRequested }) => {

    const handleFind = () => {
        onFindRequested(value);
    }

    return (
        <form noValidate className="flex w-full px-4 py-8" onSubmit={handleFind}>
            <div className="flex flex-wrap items-end -mx-3 mb-2 space-x-4 w-full">
                <FormField title="Keyword(s)" className="grow">
                    <TextEditor placeholder="Type in any related keyword or identifier..." value={value} onChange={onChange} />
                </FormField>
                <button 
                    type="submit" 
                    className="block appearance-none border bg-blue-900 hover:bg-blue-900 text-white py-2 px-4 rounded drop-shadow-sm focus:drop-shadow-lg focus:outline-none">
                    Find
                </button>
            </div>
        </form>
    )
}

