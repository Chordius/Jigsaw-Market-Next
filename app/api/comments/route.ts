import { NextResponse } from 'next/server';
import { getCommentsByMarketIdService, createCommentService } from '@/services/comment.services';
import { baseResponse } from '@/lib/base_response';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const marketId = searchParams.get('marketId');

        if (!marketId) {
            return NextResponse.json(
                baseResponse(false, "marketId query parameter is required", null),
                { status: 400 }
            );
        }

        const comments = await getCommentsByMarketIdService(marketId);

        return NextResponse.json(
            baseResponse(true, "Successfully fetched comments", comments),
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Error fetching comments:', error.message);
        return NextResponse.json(
            baseResponse(false, "Internal server error while fetching comments", null),
            { status: 500 }
        );
    }
}

// Handle POST /api/comments
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { localUserId, marketId, content } = body;

        if (!localUserId || !marketId || !content) {
            return NextResponse.json(
                baseResponse(false, "localUserId, marketId, and content are required", null),
                { status: 400 }
            );
        }

        if (content.trim().length === 0) {
            return NextResponse.json(
                baseResponse(false, "Comment content cannot be empty", null),
                { status: 400 }
            );
        }

        const newComment = await createCommentService(localUserId, marketId, content);

        return NextResponse.json(
            baseResponse(true, "Comment created successfully", newComment),
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Error creating comment:', error.message);
        return NextResponse.json(
            baseResponse(false, "Internal server error while creating comment", null),
            { status: 500 }
        );
    }
}