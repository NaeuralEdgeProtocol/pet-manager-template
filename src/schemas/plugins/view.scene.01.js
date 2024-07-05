export const VIEW_SCENE_SIGNATURE = 'VIEW_SCENE_01';

export const pluginDefinition = {
    schema: {
        name: 'View Scene',
        description: 'This plugin is able to extract an witness image from a video stream or a video file.',
        type: VIEW_SCENE_SIGNATURE,
        fields: [
            {
                key: 'NR_WITNESSES',
                type: 'integer',
                label: 'Witness Count',
                description: 'Number of iterations before stopping execution.',
                default: 5,
                required: true,
                allowedValues: {
                    min: 1,
                    max: 200,
                },
            },
            {
                key: 'PROCESS_DELAY',
                type: 'float',
                label: 'Sample Delay',
                description: 'Timespan between each iteration of the process.',
                default: 1.5,
                required: true,
                allowedValues: null,
            },
        ],
        options: {
            linkable: false,
        },
    },
};
