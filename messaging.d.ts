export type InboxEvent = {
    data: any;
    replyId: string|null;
}

export type Message = {
    recipient: string;
    data: any;
    maxAttempts?: number;
    senderId?: string;
};

declare const register: (alias:string, inbox:Function) => string;
declare const unregister: (inboxId:string) => void;
declare const Message: (messsage:Message) => void;
declare const reply: (replyId:string, message:Message) => void;