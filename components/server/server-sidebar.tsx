import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db"
import { ChannelType } from "@prisma/client"
import { redirect } from "next/navigation"
import { ServerHeader } from "./server-header"

interface ServerSideBarProps {
    serverId: string
}

export const ServerSideBar = async ({
    serverId
}: ServerSideBarProps) => {

    const profile = await currentProfile()

    if (!profile) {
        return redirect('/')
    }

    const server = await db.server.findUnique({
        where: {
            id: serverId,
        },
        include: {
            channels: { // to show all channels
                orderBy: {
                    createdAt: 'asc'
                }
            },
            members: { // showing members by roles
                include: {
                    profile: true
                },
                orderBy: {
                    role: 'asc'
                }
            },
        }
    })

    // separate text, audio, video channels
    const textChannels = server?.channels.filter((channel) => channel.type === ChannelType.TEXT)
    const audioChannels = server?.channels.filter((channel) => channel.type === ChannelType.AUDIO)
    const videoChannels = server?.channels.filter((channel) => channel.type === ChannelType.VIDEO)
    // pulling members in server by filtering out user themselves
    const members = server?.members.filter((member) => member.profileId !== profile.id)

    if (!server) {

        return redirect('/')
    }

    // check user's role by finding the user with their profile ID and then pulling their role
    const role = server.members.find((member) => member.profileId === profile.id)?.role

    return (
        <div className="flex flex-col h-full text-primary w-full dark:bg-[#2b2d31] bg-[#f2f3f5]">
            <ServerHeader
                server={server}
                role={role} />

        </div>
    )
}