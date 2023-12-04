import * as Misskey from "misskey-js"
import { FormEvent, useState, ChangeEvent } from "react"

type NoteAndChannel = Misskey.entities.Note & {
  channelId: string
  channel: Misskey.entities.Channel
}

type Reaction = Misskey.entities.NoteReaction & {
  note: NoteAndChannel
}

export default function Home() {
  const [reactions, setReactions] = useState<Reaction[]>([])
  const [message, setMessage] = useState<string>("")
  const [filterdReactions, setFilterdReactions] = useState<Reaction[]>([])

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const response = await fetch("/api/search", {
      method: "POST",
      body: JSON.stringify(Object.fromEntries(formData)),
    })
    if (response.status === 400) {
      setMessage("リアクションが公開になっているか確認してね")
      setReactions([])
      setFilterdReactions([])
      return
    }
    if (response.status === 200) {
      const data = await response.json()
      // channelの投稿は除外
      console.log(ignoreChannel(data.reactions))
      setReactions(ignoreChannel(data.reactions))
      setFilterdReactions(ignoreChannel(data.reactions))
      setMessage("")
    }
  }

  function ignoreChannel(reactions: Reaction[]) {
    return reactions.filter((reaction) => !reaction.note.channel)
  }

  function filter(e: ChangeEvent<HTMLInputElement>) {
    setFilterdReactions(
      reactions.filter((reaction) =>
        reaction.type.startsWith(":" + e.target.value)
      )
    )
  }

  function replaceType(type: string) {
    return type.replace(/@\.:$/, ":")
  }

  return (
    <main className="container mx-auto md:px-24 px-4 py-4">
      <div>
        <h1 className="text-2xl">リアクションでノートを検索するやつ</h1>
        <p className="mt-2">※APIの仕様上100件までしか取得できません</p>
        <p>※設定でリアクションを公開している必要があります</p>
        <p>※チャンネルの投稿は除外してあります</p>
      </div>
      <form onSubmit={onSubmit} className="grid grid-flow-row gap-2 mt-4">
        <div className="form-control">
          <label htmlFor="username" className=" text-md">
            idを入れてね
          </label>
          <input
            type="text"
            id="username"
            name="username"
            placeholder="user id"
            className="input input-bordered border-primary w-full max-w-sm mt-2"
            required
          />
        </div>
        <button className="btn btn-primary max-w-sm" type="submit">
          ノート取得
        </button>
      </form>
      <p className="mt-2 text-xl text-error">{message}</p>
      <div className="form-control mt-2">
        <label htmlFor="reaction">カスタム絵文字を入れてね</label>
        <input
          type="text"
          id="reaction"
          name="reaction"
          placeholder="例: kusa"
          className="input input-bordered w-full border-primary max-w-sm mt-2"
          onChange={filter}
        />
      </div>
      <div className="grid gap-2 mt-4">
        {filterdReactions.map((reaction) => {
          return (
            <div
              key={reaction.id}
              className=" border border-black p-2 rounded-md"
            >
              <div className="font-bold">{replaceType(reaction.type)}</div>
              <div>
                {reaction.note.user.name} @{reaction.note.user.username}
              </div>
              <div>{reaction.note.text}</div>
            </div>
          )
        })}
      </div>
    </main>
  )
}
