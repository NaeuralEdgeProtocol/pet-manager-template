export const PET_DETECTOR_SIGNATURE = 'PET_DETECTOR_01';

export const pluginDefinition = {
    schema: {
        name: 'Pet Detector',
        description: 'This plugin is able to see your pets.',
        type: PET_DETECTOR_SIGNATURE,
        fields: [
            {
                key: 'REPORT_PERIOD',
                type: 'integer',
                label: 'Time between witnesses',
                description: 'desc.',
                default: 30,
                required: true,
                allowedValues: {
                    min: 1,
                    max: 300,
                },
            },
        ],
        options: {
            linkable: false,
        },
    },
};
