import configMLC from './mlc'
import { LANGUAGES } from './translation'

const EXTENSION_ID = "lkfaajachdpegnlpikpdajccldcgfdde";

export const config = {
    EXTENSION_ID,
    mlc: {
        appConfig: configMLC
    },
    translation: {
        LANGUAGES
    },
}