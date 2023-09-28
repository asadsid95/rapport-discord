import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db"
import { redirectToSignIn } from "@clerk/nextjs"
import { redirect } from "next/navigation"

interface InviteCodePageProps {
    params: {
        inviteCode: String
    }
}

const InviteCodePage = async ({
    params
}: InviteCodePageProps) => {

    const profile = await currentProfile()

    if (!profile) {
        return redirectToSignIn()
    }

    if (!params.inviteCode) {
        return redirect('/')
    }

    // query to find if user is already part of server
    const existingServer = await db.server.findFirst({
        where: {
            inviteCode: params.inviteCode,
            members: {
                some: {
                    profileId: profile.id
                }
            }
        }
    })

    if (existingServer) {
        return redirect(`/servers/${existingServer.id}`)
    }

    // query to add user to server 
    const server = await db.server.update({
        where: {
            inviteCode: params.inviteCode
        },
        data: {
            members: {
                create: [
                    {
                        profileId: profile.id
                    }
                ]
            }
        }
    })

    if (server) {
        return redirect(`/servers/${server.id}`)
    }

    return null

}

export default InviteCodePage