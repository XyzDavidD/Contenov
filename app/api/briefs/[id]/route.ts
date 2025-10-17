import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const briefId = params.id;
    
    console.log(`[API] Fetching brief with ID: ${briefId} for user: ${user.id}`);
    
    // Fetch brief from database and verify ownership
    const { data: brief, error } = await supabaseAdmin
      .from('briefs')
      .select('*')
      .eq('id', briefId)
      .eq('user_id', user.id)
      .single();
    
    if (error) {
      console.error('[API] Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch brief' },
        { status: 500 }
      );
    }
    
    if (!brief) {
      console.log('[API] Brief not found or access denied');
      return NextResponse.json(
        { error: 'Brief not found' },
        { status: 404 }
      );
    }
    
    console.log(`[API] Brief found: "${brief.topic}"`);
    
    return NextResponse.json({
      success: true,
      brief
    });
    
  } catch (error) {
    console.error('[API] Unexpected error:', error);
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const briefId = params.id;
    
    console.log(`[API] Deleting brief with ID: ${briefId} for user: ${user.id}`);
    
    // Delete brief from database (only if owned by user)
    const { error } = await supabaseAdmin
      .from('briefs')
      .delete()
      .eq('id', briefId)
      .eq('user_id', user.id);
    
    if (error) {
      console.error('[API] Database error:', error);
      return NextResponse.json(
        { error: 'Failed to delete brief' },
        { status: 500 }
      );
    }
    
    console.log(`[API] Brief deleted successfully: ${briefId}`);
    
    return NextResponse.json({
      success: true,
      message: 'Brief deleted successfully'
    });
    
  } catch (error) {
    console.error('[API] Unexpected error:', error);
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}


