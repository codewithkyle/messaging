import { ActorModel } from "./actor-model";

const messenger = new ActorModel();
const register = messenger.register.bind(messenger);
const unregister = messenger.unregister.bind(messenger);
const message = messenger.message.bind(messenger);
const reply = messenger.reply.bind(messenger);

export { register, unregister, message, reply };