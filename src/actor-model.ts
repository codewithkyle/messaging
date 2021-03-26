import { InboxEvent, Message } from "../messaging";

type Inbox = {
    id: string;
    inbox: Function;
}

interface ActorModelMessage extends Message {
    attempts?: number;
}

export class ActorModel {
    private inboxes: {
        [recipient:string]: Array<Inbox>;
    };
    private queue: Array<ActorModelMessage>;

    constructor(){
        this.inboxes = {};
        this.queue = [];
        this.flushQueue();
    }

    private flushQueue(){
        const queue = this.queue.splice(0, this.queue.length - 1);
        for (let i = queue.length - 1; i >= 0; i--){
            if (this.inboxes?.[queue[i].recipient]){
                const message:InboxEvent = {
                    data: queue[i].data,
                    replyId: queue[i].senderId,
                };
                for (let j = 0; j < this.inboxes[queue[i].recipient].length; j++){
                    this.inboxes[queue[i].recipient][j].inbox(message);
                }
            } else {
                queue[i].attempts++;
                if (queue[i].attempts >= queue[i].maxAttempts){
                    queue.splice(i, 1);
                }
            }
        }
        this.queue = [...this.queue, ...queue];
    }

    private sendMessage(msg:ActorModelMessage):void{
        if (this.inboxes?.[msg.recipient]){
            const message:InboxEvent = {
                data: msg.data,
                replyId: msg.senderId,
            };
            for (let j = 0; j < this.inboxes[msg.recipient].length; j++){
                this.inboxes[msg.recipient][j].inbox(message);
            }
        } else if (msg.maxAttempts > 1) {
            this.queue.push(msg);
        }
    }

    private uid(): string {
        return new Array(4)
            .fill(0)
            .map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16))
            .join("-");
    }

    public register(alias:string, inbox:Function): string{
        const inboxId = this.uid();
        this.inboxes[alias].push({
            id: inboxId,
            inbox: inbox,
        });
        return inboxId;
    }

    public unregister(inboxId:string): void{
        let foundInbox = false;
        for (const alias in this.inboxes){
            for (let i = 0; i < this.inboxes[alias].length; i++){
                if (this.inboxes[alias][i].id === inboxId){
                    this.inboxes[alias].splice(i, 1);
                    foundInbox = true;
                    break;
                }
            }
            if (foundInbox){
                break;
            }
        }
    }

    public message(message:Message): void{
        const msg:ActorModelMessage = Object.assign({
            maxAttempts: 1,
            senderId: null,
            attempts: 0,
            recipient: null,
            data: null,
        }, message);
        if (msg.recipient !== null && msg.data !== null){
            this.sendMessage(msg);
        }
    }

    public reply(senderId:string, message:Partial<Message>):void{
        let foundInbox = false;
        for (const alias in this.inboxes){
            for (let i = 0; i < this.inboxes[alias].length; i++){
                if (this.inboxes[alias][i].id === senderId){
                    this.inboxes[alias][i].inbox(message);
                    foundInbox = true;
                    break;
                }
            }
            if (foundInbox){
                break;
            }
        }
    }
}