import React, {useState} from "react";
import {
    MDBCard,
    MDBCardBody,
    MDBCardImage,
    MDBCol,
    MDBContainer,
    MDBIcon,
    MDBRow,
    MDBTypography,
} from "mdb-react-ui-kit";
import "@fortawesome/fontawesome-free/css/all.min.css";
import {useMutation, useQuery, useQueryClient} from "react-query";
import {Button, Form} from "react-bootstrap";
import apiUrl from "../dataProvider";
import authProvider from "../AuthProvider";
import {format} from 'date-fns';
import {useTranslate} from "react-admin";

interface User {
    id: number;
    first_name: string;
    email: string;
    last_name: string;
    avatar: string;
}

interface Comment {
    id: number;
    order: number;
    created_by: User;
    content: string;
    created_at: string;
    replies?: Comment[];
}

interface PostComment {
    content: string;
    reply?: number;
    order: string;
}

interface NestedProps {
    orderId: string;
}

const CommentBlock: React.FC<NestedProps> = ({orderId}) => {
    const translate = useTranslate();
    const queryClient = useQueryClient();
    const [replyTo, setReplyTo] = useState<number | null>(null);

    const {data, isError, isLoading} = useQuery(
        ["comments", orderId],
        () => fetchComments(orderId),
        {
            keepPreviousData: true,
        }
    );

    const mutation = useMutation((newComment: PostComment) => postComment(newComment), {
            onSuccess: () => {
                queryClient.invalidateQueries(["comments", orderId]);
            }
        }
    );

    const deleteMutation = useMutation((commentId: number) => handleDeleteClick(commentId), {
        onSuccess: () => {
            queryClient.invalidateQueries(["comments", orderId]);
        },
        onError: async (error: any) => {
            alert(translate('resources.comments.error_delete'));
        }
    });

    const handleReplyClick = (commentId: number) => {
        setReplyTo(replyTo === commentId ? null : commentId);
    };

    const onSubmit = (event: any) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const fields = Object.fromEntries(formData);

        const newComment: PostComment = {
            content: fields.content as string,
            order: orderId,
            reply: replyTo !== null ? replyTo : undefined
        };
        setReplyTo(null);
        mutation.mutate(newComment);
        event.target.reset();
    }

    const onDelete = (commentId: number) => {
        deleteMutation.mutate(commentId);
    }


    const renderComments = (comments: Comment[]) => {
        return comments.map((comment) => (
            <div key={comment.id} className="d-flex flex-start mt-4">
                <MDBCardImage
                    className="rounded-circle shadow-1-strong me-3"
                    src={comment.created_by?.avatar}
                    alt="avatar"
                    width="65"
                    height="65"
                />
                <div className="flex-grow-1 flex-shrink-1">
                    <div>
                        <div className="d-flex justify-content-between align-items-center">
                            <p className="mb-1">
                                {comment.created_by?.first_name || "Unknown"}{" "}
                                {comment.created_by?.last_name || "User"}{" "}
                                <span
                                    className="small">- {format(new Date(comment.created_at), 'dd/MM/yy HH:mm')}</span>
                            </p>
                            <div className="d-flex ms-auto">
                                <a
                                    style={{
                                        cursor: "pointer",
                                        color: "blue",
                                        marginRight: "10px",
                                    }}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleReplyClick(comment.id);
                                    }}
                                >
                                    <MDBIcon fas icon="reply" className="fa-xs"/>
                                    <span className="small">
                                           {translate('resources.comments.reply')}
                                    </span>
                                </a>
                                {/*<a*/}
                                {/*    style={{*/}
                                {/*        cursor: "pointer",*/}
                                {/*        color: "red",*/}
                                {/*    }}*/}
                                {/*    onClick={(e) => {*/}
                                {/*        e.preventDefault();*/}
                                {/*        onDelete(comment.id);*/}
                                {/*    }}*/}
                                {/*>*/}
                                {/*    <MDBIcon fas icon="trash" className="fa-xs"/>*/}
                                {/*    <span className="small">*/}
                                {/*          {translate('resources.comments.delete')}*/}
                                {/*    </span>*/}
                                {/*</a>*/}
                            </div>
                        </div>
                        <p className="small mb-0">{comment.content}</p>
                    </div>

                    {replyTo === comment.id && (
                        <div>
                            <Form onSubmit={onSubmit}>
                                <Form.Group className={"mt-3"}>
                                    <Form.Control
                                        name='content'
                                        as="textarea"
                                        placeholder={`Write your reply to ${comment.created_by}...`}
                                        rows={3}
                                    />
                                </Form.Group>
                                <Button
                                    variant="primary"
                                    type={"submit"}
                                    className="mt-2"
                                    aria-label={"Submit Reply"}>
                                    {translate('resources.comments.send_reply')}
                                </Button>
                            </Form>
                        </div>
                    )}
                    {comment.replies && comment.replies.length > 0 && (
                        <div className="ms-4">{renderComments(comment.replies)}</div>
                    )}
                </div>
            </div>
        ));
    };

    if (isLoading) {
        return <p>{translate('resources.comments.loading')}</p>;
    }

    if (isError) {
        return <p>{translate('resources.comments.loading')}</p>;
    }

    return (
        <section className="gradient-custom mb-3">
            <MDBContainer className="py-3" style={{maxWidth: "1000px"}}>
                <MDBRow className="justify-content-center">
                    <MDBCol md="12" lg="10" xl="8">
                        <MDBCard>
                            <MDBCardBody className="p-4">
                                <MDBTypography tag="h4" className="text-center mb-4">
                                    {translate('resources.comments.comments')}
                                </MDBTypography>
                                <MDBRow>
                                    <MDBCol>
                                        {data && data.length > 0 ? (
                                            renderComments(data)
                                        ) : (
                                            <p className="text-center">
                                                {translate('resources.comments.no_comments_available')}
                                            </p>
                                        )}
                                    </MDBCol>
                                </MDBRow>
                                <div>
                                    <Form onSubmit={onSubmit}>
                                        <Form.Group className={"mt-3"}>
                                            <Form.Control
                                                name='content'
                                                as="textarea"
                                                rows={3}
                                            />
                                        </Form.Group>
                                        <Button
                                            variant="primary"
                                            type={"submit"}
                                            className="mt-2"
                                            aria-label={"Submit Reply"}>
                                            {translate('resources.comments.send_comment')}
                                        </Button>
                                    </Form>
                                </div>
                            </MDBCardBody>
                        </MDBCard>
                    </MDBCol>
                </MDBRow>
            </MDBContainer>
        </section>
    );
};

const handleDeleteClick = async (commentId: number) => {
    const response = await fetch(apiUrl + `/orders/comments/${commentId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authProvider.getToken()}`,
        },
    });
    if (!response.ok) {
        throw new Error("Failed to delete comment");
    }
}

const postComment = async (newComment: { content: string; reply?: number; order: string }) => {
    const response = await fetch(apiUrl + `/orders/comments`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authProvider.getToken()}`,
        },
        body: JSON.stringify(newComment),
    });
    if (!response.ok) {
        throw new Error("Failed to post comment");
    }
    return response.json();
};

const fetchComments = async (orderId: string | undefined): Promise<Comment[]> => {
    const url = apiUrl + `/orders/comments`;
    const params = {
        filter: `{"order":${orderId}}`,
    };
    const queryString = new URLSearchParams(params).toString();
    const requestUrl = `${url}?${queryString}`;

    const response = await fetch(requestUrl, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authProvider.getToken()}`,
        },
    });
    if (!response.ok) {
        throw new Error("Failed to fetch comments");
    }
    return await response.json();
};

export default CommentBlock;
