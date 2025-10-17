"use client"
/* eslint-disable prefer-const */

import * as jose from "jose";
import { useState } from "react";

export const runtime = "edge";

type Message = { author: string, content: string };

type ClientMessage =
  { kind: "Get Messages"; }
  | { kind: "Upload Message"; content: string }
  | { kind: "Destroy" };

type ServerMessage = { kind: "Messages", messages: Message[] }
  | { kind: "New Message"; message: Message };

export default function Game() {
  let [state, setState] = useState(1);

  let [rid, setRid] = useState("");
  let [name, setName] = useState("");
  let [teacher, setTeacher] = useState(false);

  let [code, setCode] = useState<string | null>(null);

  let [messages, setMessages] = useState<Message[]>([]);
  let [ws, setWs] = useState<WebSocket | undefined>();

  let [msg, setMsg] = useState("");

  function connect() {
    console.log("connecting with " + teacher);
    connectAsync();
  }

  async function connectAsync() {
    // so secure
    // TODO: move to server and use real secret
    const secret = jose.base64url.decode('zH4NRP1HMALxxCFnRZABFA7GOJtzU_gIj02alfL1lvI');

    let id = rid;

    if (teacher) {
      id = "" + (Math.floor((Math.random() * 899999)) + 100000);
      setRid(id);
    }

    const jk = await new jose.EncryptJWT({
      name: name,
      teacher: teacher
    })
      .setProtectedHeader({ alg: 'dir', enc: 'A128CBC-HS256' })
      .encrypt(secret);

    let socket = new WebSocket(`wss://websocket.quokka-app.workers.dev/ws?room_id=${id}&jk=${jk}`);
    setWs(socket);

    socket.addEventListener("message", (event) => {
      let msg: ServerMessage = JSON.parse(event.data);

      if (msg.kind == "Messages") {
        setMessages((old) => [...old, ...msg.messages]);
      } else if (msg.kind == "New Message") {
        setMessages((old) => [...old, msg.message]);
      }
    });

    socket.addEventListener("open", () => {
      if (teacher) {
        setState(4);
      } else {
        setState(3);
      }

      let m: ClientMessage = { kind: "Get Messages" };
      socket.send(JSON.stringify(m));
    });

    socket.addEventListener("error", (e) => {
      console.log(e);
      setCode("Code not found");
    });
  }

  function sendMessage() {
    if (ws) {
      let n: ClientMessage = { kind: "Upload Message", content: msg };
      setMsg("");
      ws.send(JSON.stringify(n));
    } else {
      console.log("WS object doesn't exist?");
    }
  }

  if (state == 1) {
    return (
      <div className="space-y-2 flex flex-col items-center">
        <p className="text-center text-2xl font-semibold text-orange-600">
          Enter the join code below
        </p>

        <input className="w-full border text-gray-700 border-orange-400 px-2 py-1 rounded-md focus:ring-2 focus:ring-orange-400" maxLength={6}
          value={rid} onChange={(e) => setRid(e.target.value)}
        />

        <button onClick={() => { setState(state + 1); }} className="bg-orange-500/25 hover:bg-orange-600/25 hover:scale-110 text-orange-600 px-4 py-2 rounded-lg border border-orange-600 duration-5050">Submit</button>

        <button onClick={() => {
          setTeacher(true);
          setState(state + 1);
        }} className="bg-orange-500/25 hover:bg-orange-600/25 hover:scale-110 text-orange-600 px-4 py-2 rounded-lg border border-orange-600 duration-50">I&apos;m a teacher</button>
      </div>
    );
  } else if (state == 2) {
    return (
      <div className="space-y-2 flex flex-col items-center">
        <p className="text-center text-2xl font-semibold text-orange-600">
          Enter your name below
        </p>

        <input className="w-full border text-gray-700 border-orange-400 px-2 py-1 rounded-md focus:ring-2 focus:ring-orange-400"
          value={name} onChange={(e) => setName(e.target.value)}
        />

        <button onClick={connect} className="bg-orange-500/25 hover:bg-orange-600/25 hover:scale-110 text-orange-600 px-4 py-2 rounded-lg border border-orange-600 duration-5050">Submit</button>

        {code ? <p className="text-orange-600">{code}</p> : <></>}
      </div>
    );
  } else if (state == 3) {
    let board = messages.map((x, i) => (
      <div className="bg-white border-orange-400 border p-2 max-w-md" key={i}>
        <p className="text-orange-700 text-xl">{x.author.substring(0, 8)}</p>
        <p className="text-gray-700 text-xl break-all">{x.content}</p>
      </div>
    ));

    return (
      <div className="space-y-2 flex flex-col items-center">
        <div className="grid grid-cols-4 gap-2 px-20">
          {board}
        </div>

        <p className="text-center text-2xl font-semibold text-orange-600">
          Enter your message below
        </p>

        <input value={msg} onChange={(e) => { setMsg(e.target.value) }} className="mx-2 max-w-sm w-full border text-gray-700 border-orange-400 px-2 py-1 rounded-md focus:ring-2 focus:ring-orange-400" />

        <button onClick={sendMessage} className="bg-orange-500/25 hover:bg-orange-600/25 hover:scale-110 text-orange-600 px-4 py-2 rounded-lg border border-orange-600 duration-50">Submit</button>
      </div>
    );
  } else if (state == 4) {
    let board = messages.map((x, i) => (
      <div className="bg-white border-orange-400 border p-2 max-w-md" key={i}>
        <p className="text-orange-700 text-xl">{x.author.substring(0, 8)}</p>
        <p className="text-gray-700 text-xl break-all">{x.content}</p>
      </div>
    ));

    return (
      <div className="space-y-2 flex flex-col items-center">
        <div className="grid grid-cols-4 gap-2 px-20">
          {board}
        </div>

        <p className="text-center text-2xl font-semibold text-orange-600">
          Your class code is:
        </p>

        <p className="text-orange-600 text-center text-8xl">
          {rid}
        </p>
      </div>
    );
  }
}
