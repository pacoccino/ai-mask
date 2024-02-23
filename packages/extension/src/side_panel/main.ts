import { getModels } from "@/lib/database";


function setLabel(id: string, text: string) {
    const label = document.getElementById(id);
    if (label == null) {
        throw Error("Cannot find label " + id);
    }
    label.innerText = text;
}

async function main() {
    const models = await getModels()
    setLabel('models', JSON.stringify(models))

}

main().catch(console.error)