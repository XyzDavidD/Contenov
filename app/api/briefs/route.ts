import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    const { data, error } = await supabaseAdmin
      .from('briefs')
      .insert({
        user_id: user.id,
        topic: body.topic,
        seo_data: body.seoData,
        target_specs: body.targetSpecs,
        structure: body.structure,
        competitor_analysis: body.competitorAnalysis,
        content_requirements: body.contentRequirements,
        writing_instructions: body.writingInstructions,
        meta_data: body.metaData
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, brief: data })
  } catch (error) {
    console.error('Error saving brief:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save brief' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('briefs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ success: true, briefs: data })
  } catch (error) {
    console.error('Error fetching briefs:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch briefs' },
      { status: 500 }
    )
  }
}


