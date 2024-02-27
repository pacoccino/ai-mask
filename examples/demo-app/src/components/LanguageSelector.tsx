import { config } from '@ai-mask/sdk'

export default function LanguageSelector({ onChange, value }: { onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, value: string }) {
    return (
        <select
            onChange={onChange}
            value={value}
            className="border-none text-blue-600 font-semibold w-64 overflow-hidden whitespace-nowrap text-ellipsis"
        >
            {Object.entries(config.translation.LANGUAGES).map(([key, value]) => {
                return <option key={key} value={value}>{key}</option>
            })}
        </select>
    )
}