import type { NextApiRequest, NextApiResponse } from "next"
import * as Misskey from "misskey-js"

type Reaction = Misskey.entities.NoteReaction & {
  note: Misskey.entities.Note
}
type Data = {
  reactions: Reaction[]
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const origin = "https://misskey.systems"
  const token = process.env.MISSKEY_TOKEN
  const userName = JSON.parse(req.body).username
  console.log(`userName: ${userName}`)
  const userData = {
    i: token,
    username: userName,
    limit: 1,
  }
  const userSearchResponse = await fetch(
    `${origin}/api/users/search-by-username-and-host`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    }
  )
  const userSearchResJson = await userSearchResponse.json()

  if (!("id" in userSearchResJson[0])) {
    return res.status(400).json({ reactions: [] })
  }
  const searchData = {
    i: token,
    userId: userSearchResJson[0].id,
    limit: 100,
  }

  const searchResponse = await fetch(`${origin}/api/users/reactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(searchData),
  })
  const result = await searchResponse.json()
  if (result.error) {
    console.log(result)
    return res.status(400).json({ reactions: [] })
  }
  res.status(200).json({ reactions: result })
}
