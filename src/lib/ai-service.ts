// AI Service for generating OJT narrative reports
// Supports both Google Gemini and OpenAI GPT

export interface CalendarNote {
  date: string
  content: string
}

export interface NarrativeGenerationOptions {
  period: 'day' | 'week' | 'month' | 'custom'
  startDate: string
  endDate: string
  notes: CalendarNote[]
  userName?: string
}

export interface AIProvider {
  name: 'gemini' | 'openai'
  apiKey: string
  model?: string
}

// Default AI provider configuration
const DEFAULT_AI_PROVIDER: AIProvider = {
  name: 'gemini',
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
  model: 'gemini-1.5-flash'
}

// Fallback to OpenAI if Gemini key is not available
const OPENAI_PROVIDER: AIProvider = {
  name: 'openai',
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  model: 'gpt-3.5-turbo'
}

export class NarrativeAIService {
  private provider: AIProvider

  constructor(provider?: AIProvider) {
    // Use provided provider or default to Gemini, fallback to OpenAI
    if (provider) {
      this.provider = provider
    } else if (DEFAULT_AI_PROVIDER.apiKey) {
      this.provider = DEFAULT_AI_PROVIDER
    } else if (OPENAI_PROVIDER.apiKey) {
      this.provider = OPENAI_PROVIDER
    } else {
      throw new Error('No AI API key found. Please set NEXT_PUBLIC_GEMINI_API_KEY or NEXT_PUBLIC_OPENAI_API_KEY')
    }
  }

  private generatePrompt(options: NarrativeGenerationOptions): string {
    const { period, startDate, endDate, notes, userName } = options
    
    let periodText: string
    if (period === 'custom') {
      periodText = 'custom date range'
    } else {
      periodText = period === 'day' ? 'daily' : period === 'week' ? 'weekly' : 'monthly'
    }
    
    const dateRange = `from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`
    
    const notesText = notes.map(note => {
      const date = new Date(note.date).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
      return `${date}: ${note.content}`
    }).join('\n\n')

    return `You are an experienced OJT (On-the-Job Training) supervisor and mentor helping a trainee write a comprehensive, detailed narrative report. 

Generate a rich, expansive OJT narrative report ${dateRange} for ${userName || 'the trainee'}.

The trainee's brief daily notes are:
${notesText}

**IMPORTANT**: Your task is to transform these brief notes into a detailed, professional narrative. DO NOT simply repeat the notes - expand upon them creatively and professionally. For each note, imagine the full context and elaborate on:

1. **Technical Details**: If they mention "New Project," describe what kind of project it might be, the technologies used, challenges faced, and implementation details
2. **Learning Experiences**: Expand on what skills were learned, how they applied theoretical knowledge, and what insights were gained
3. **Problem-Solving**: Describe any obstacles encountered and how they were overcome
4. **Collaboration**: Mention teamwork, mentorship, or interactions with colleagues
5. **Professional Growth**: Show how each activity contributed to their development as a professional
6. **Real-World Application**: Connect activities to actual industry practices and standards

**Guidelines**:
- Write in first person ("I", "my", "me") as if the trainee is reflecting on their experience
- Transform brief notes like "New Project" into detailed paragraphs (3-5 sentences each)
- Be specific and add realistic technical details based on common OJT contexts
- Show progression and growth throughout the period
- Maintain professional tone while being descriptive and engaging
- Aim for 400-600 words total
- Focus on making the narrative feel authentic and detailed

**Example Transformation**:
- If note says: "New Project - React dashboard"
- Expand to: "I began developing a comprehensive React dashboard project which challenged me to apply my frontend development skills in a real-world context. The project involved creating interactive data visualizations using React hooks and state management, which required me to deepen my understanding of component lifecycle and performance optimization. I implemented responsive design principles and worked with REST APIs to fetch and display real-time data, giving me valuable experience in full-stack development."

Create a complete, flowing narrative that reads like a detailed reflection rather than a summary of notes.`
  }

  async generateNarrative(options: NarrativeGenerationOptions): Promise<string> {
    const prompt = this.generatePrompt(options)

    try {
      if (this.provider.name === 'gemini') {
        return await this.generateWithGemini(prompt)
      } else if (this.provider.name === 'openai') {
        return await this.generateWithOpenAI(prompt)
      } else {
        throw new Error(`Unsupported AI provider: ${this.provider.name}`)
      }
    } catch (error) {
      console.error('Error generating narrative:', error)
      
      // Fallback to template if AI fails
      return this.generateFallbackNarrative(options)
    }
  }

  private async generateWithGemini(prompt: string): Promise<string> {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.provider.model}:generateContent?key=${this.provider.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`)
    }

    const data = await response.json()
    
    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text
    } else {
      throw new Error('No content generated by Gemini')
    }
  }

  private async generateWithOpenAI(prompt: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.provider.apiKey}`,
      },
      body: JSON.stringify({
        model: this.provider.model || 'gpt-3.5-turbo',
        messages: [{
          role: 'user',
          content: prompt
        }],
        max_tokens: 2048,
        temperature: 0.7,
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    
    if (data.choices?.[0]?.message?.content) {
      return data.choices[0].message.content
    } else {
      throw new Error('No content generated by OpenAI')
    }
  }

  private generateFallbackNarrative(options: NarrativeGenerationOptions): string {
    const { period, startDate, endDate, notes } = options
    const periodText = period === 'day' ? 'daily' : period === 'week' ? 'weekly' : 'monthly'
    const dateRange = `from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`
    
    const expandedNotes = notes.map(note => {
      const date = new Date(note.date).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
      
      // Expand on brief notes with more detail
      let expandedContent = note.content
      if (note.content.toLowerCase().includes('project')) {
        expandedContent += ` This project challenged me to apply my technical skills in a real-world context, requiring careful planning, implementation, and problem-solving throughout the development lifecycle.`
      }
      if (note.content.toLowerCase().includes('meeting') || note.content.toLowerCase().includes('discussion')) {
        expandedContent += ` The collaborative discussion provided valuable insights and allowed me to contribute ideas while learning from experienced team members.`
      }
      if (note.content.toLowerCase().includes('learn') || note.content.toLowerCase().includes('study')) {
        expandedContent += ` This learning experience expanded my knowledge base and gave me practical skills that I can apply to future projects and challenges.`
      }
      if (note.content.toLowerCase().includes('fix') || note.content.toLowerCase().includes('bug') || note.content.toLowerCase().includes('error')) {
        expandedContent += ` Troubleshooting this issue strengthened my analytical thinking and taught me systematic approaches to identifying and resolving technical problems.`
      }
      if (note.content.toLowerCase().includes('new') || note.content.toLowerCase().includes('first')) {
        expandedContent += ` This new experience pushed me out of my comfort zone and helped me develop confidence in tackling unfamiliar challenges.`
      }
      
      return `**${date}**: ${expandedContent}`
    }).join('\n\n')

    return `${period.charAt(0).toUpperCase() + period.slice(1)} OJT Narrative Report (${dateRange})

This ${periodText} narrative reflects my comprehensive On-the-Job Training experience and progress during the specified period. Throughout this timeframe, I have demonstrated significant growth in both technical capabilities and professional development through active engagement in various learning opportunities and practical tasks.

${expandedNotes}

The documented activities above reflect my dedication to continuous learning and skill development. Each day provided valuable opportunities to contribute to ongoing projects while expanding my knowledge base and practical abilities in real-world development environments. The hands-on experience has been instrumental in bridging theoretical knowledge with practical application, preparing me for increased responsibilities in my professional journey.

Looking forward, I am committed to building upon this foundation by taking on more complex challenges and contributing meaningfully to team objectives. The experiences and insights gained during this ${periodText} period have strengthened my technical competencies, enhanced my problem-solving abilities, and prepared me for greater responsibilities in my OJT journey and future career endeavors.`
  }

  // Helper method to check if AI service is available
  static isAvailable(): boolean {
    return !!(process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY)
  }

  // Get available provider
  static getAvailableProvider(): AIProvider | null {
    if (DEFAULT_AI_PROVIDER.apiKey) {
      return DEFAULT_AI_PROVIDER
    } else if (OPENAI_PROVIDER.apiKey) {
      return OPENAI_PROVIDER
    }
    return null
  }
}
