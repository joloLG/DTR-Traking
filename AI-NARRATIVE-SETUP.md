# AI Narrative Generation Setup

This guide explains how to set up AI-powered narrative generation for OJT reports.

## Database Setup

1. Run the calendar notes schema:
   ```sql
   -- Execute the contents of calendar-notes-schema.sql in your Supabase database
   ```

## Environment Variables

Add one of the following API keys to your `.env.local` file:

### Option 1: Google Gemini (Recommended)
```env
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

To get a Gemini API key:
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy it to your environment variables

### Option 2: OpenAI
```env
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
```

To get an OpenAI API key:
1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy it to your environment variables

## Features Implemented

### ✅ Database Integration
- Calendar notes are now stored in the `calendar_notes` table
- Notes persist across sessions
- Row Level Security ensures users can only access their own notes

### ✅ AI-Powered Generation
- Supports both Google Gemini and OpenAI GPT
- Automatic fallback to template if AI fails
- Professional narrative generation based on calendar notes

### ✅ Enhanced Generation Modal
- Beautiful modal interface for selecting period (Day/Week/Month)
- Visual date range display
- Loading states and error handling

### ✅ Improved User Experience
- Notes are automatically saved to database
- Better error messages and success feedback
- Responsive design for mobile devices

## How to Use

1. **Add Calendar Notes**: Click on any date in the calendar to add notes about your OJT activities
2. **Generate Narrative**: Click "Generate AI Narrative" button
3. **Select Period**: Choose Day, Week, or Month in the modal
4. **Review and Copy**: The generated narrative appears in the text area where you can copy it

## AI Generation Details

The AI service:
- Combines all notes from the selected period
- Creates a professional, first-person narrative
- Highlights accomplishments and learning moments
- Maintains appropriate tone for OJT documentation
- Generates 300-500 word reports

## Troubleshooting

### AI Generation Fails
- Check your API key is correctly set
- Ensure you have calendar notes for the selected period
- The system will fallback to a template if AI is unavailable

### Database Issues
- Ensure the calendar-notes-schema.sql was executed
- Check Supabase RLS policies are working correctly
- Verify user authentication is functioning

### Notes Not Saving
- Check browser console for errors
- Ensure user is properly authenticated
- Verify Supabase connection is working
