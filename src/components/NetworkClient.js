import { NaeuralWebClient } from '@naeural/js-web-client';
import {VIEW_SCENE_SIGNATURE, pluginDefinition as ViewSceneDefinition} from '../schemas/plugins/view.scene.01';
import {PET_DETECTOR_SIGNATURE, pluginDefinition as PetDetectorDefinition} from '../schemas/plugins/pet.detector.01';

const mqttOptions = {
    url: 'ws://localhost:9001',
    username: '***',
    password: '***',
};

const savedFleet = localStorage.getItem('fleetArray');
const initialFleet = savedFleet ? JSON.parse(savedFleet) : [];

const options = {
    initiator: 'web-client',
    fleet: initialFleet,
};

// Export as a singleton
const client = new NaeuralWebClient(options);

client.setNetworkConnectionOptions(mqttOptions);

client.registerPluginSchema(VIEW_SCENE_SIGNATURE, ViewSceneDefinition.schema);
client.registerPluginSchema(PET_DETECTOR_SIGNATURE, PetDetectorDefinition.schema);

export default client;