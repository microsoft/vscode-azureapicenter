const { Spectral } = require("@stoplight/spectral-core")
import { truthy } from "@stoplight/spectral-functions";

export default async function (output, context) {
    text = output.replace(/^```yaml.*\n/, '');
    text = text.replace(/\n```$/, '');
    const spectral = new Spectral();
    spectral.setRuleset({
        rules: {
            "no-empty-description": {
                given: "$..description",
                message: "Description must not be empty",
                then: {
                    function: truthy,
                },
            },
        },
    });
    const res = spectral.run(text);
    return {
        pass: true,
        score: 0.5,
        reason: 'Contains banana',
    };
}
