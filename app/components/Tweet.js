import React, { useState, useEffect } from 'react'
import { ChartBarIcon, ChatIcon, HeartIcon, TrashIcon, UploadIcon } from '@heroicons/react/outline'
import { HeartIcon as FilledHeartIcon } from '@heroicons/react/solid'
import Moment from 'react-moment'
import { useDispatch, useSelector } from 'react-redux'
import { openCommentModal, openLoginModal, setCommentTweet } from '@/redux/modalSlice';
import { useRouter } from 'next/navigation';
import { arrayRemove, arrayUnion, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';

export default function Tweet({ data, id }) {

    const dispatch = useDispatch();
    const router = useRouter();
    const user = useSelector(state => state.user);
    const [likes, setLikes] = useState([]);
    const [comments, setComments] = useState([]);

    async function likeComment(e) {
        e.stopPropagation();

        if (!user.username) {
            dispatch(openLoginModal())
            return
        }

        if (likes.includes(user.uid)) {
            await updateDoc(doc(db, "tweets", id), {
                likes: arrayRemove(user.uid)
            })
        } else {
            await updateDoc(doc(db, "tweets", id), {
                likes: arrayUnion(user.uid)
            })
        }

    }

    async function deleteTweet(e) {
        e.stopPropagation()
        await deleteDoc(doc(db, "tweets", id))
    }

    useEffect(() => {
        if (!id) return

        const unsubscribe = onSnapshot(doc(db, "tweets", id), (doc) => {
            setLikes(doc?.data()?.likes)
            setComments(doc?.data()?.comments)
        })

        return unsubscribe
    }, [])

    return (
        <div className='border-b border-gray-700 cursor-pointer' onClick={() => {
            if (!user.username) {
                dispatch(openLoginModal())
                return
            }

            router.push("/" + id)
        }}>
            <TweetHeader data={data} />
            <div className='p-3 ml-16 text-gray-500 flex space-x-14'>
                <div className='flex justify-center items-center space-x-2' onClick={(e) => {
                    e.stopPropagation()

                    if (!user.username) {
                        dispatch(openLoginModal())
                        return
                    }

                    dispatch(setCommentTweet({
                        id: id,
                        tweet: data?.tweet,
                        photoUrl: data?.photoUrl,
                        name: data?.name,
                        username: data?.username
                    }))
                    dispatch(openCommentModal())
                }}>
                    <ChatIcon className="w-5 cursor-pointer hover:text-green-400" />
                    {comments?.length > 0 && <span>{comments.length}</span>}
                </div>
                <div onClick={likeComment} className='flex justify-center items-center space-x-2'>
                    {likes.includes(user.uid) ? <FilledHeartIcon className='w-5 cursor-pointer text-pink-400' /> : <HeartIcon className='w-5 cursor-pointer hover:text-pink-400' />}
                    {likes.length > 0 && <span>{likes.length}</span>}
                </div>
                {user.uid === data?.uid && <div className='cursor-pointer hover:text-red-600' onClick={deleteTweet}>
                    <TrashIcon className='w-5' />
                </div>}
                <ChartBarIcon className='w-5 cursor-not-allowed' />
                <UploadIcon className='w-5 cursor-not-allowed' />
            </div>
        </div>
    )
}

export function TweetHeader({ data }) {
    return (
        <div className='flex space-x-3 p-3 border-gray-700'>
            <img
                className='w-11 h-11 rounded-full object-cover'
                src={data?.photoUrl} />
            <div>
                <div className='flex space-x-2 items-center text-gray-500 mb-1'>
                    <h1 className='text-white font-bold'>{data?.name}</h1>
                    <span>@{data?.username}</span>
                    <div className='w-1 h-1 bg-gray-500 rounded-full'></div>
                    <Moment fromNow>
                        {data?.timestamp?.toDate()}
                    </Moment>
                </div>
                <span>{data?.tweet}</span>

                {data?.image && <img className='object-cover rounded-md mt-3 max-h-80 border border-gray-700 ' src={data?.image} />}
            </div>
        </div>
    )
}