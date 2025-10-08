import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'

/**
 * Extrai texto de um arquivo PDF
 * @param pdfBuffer Buffer do PDF
 * @returns Texto extraído do PDF
 */
export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  try {
    // Desabilitar worker para ambiente Node.js
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(pdfBuffer),
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true
    })

    const pdf = await loadingTask.promise
    const numPages = pdf.numPages

    console.log(`📄 PDF tem ${numPages} página(s)`)

    let fullText = ''

    // Extrair texto de cada página
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()

      // Concatenar todos os itens de texto da página
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ')

      fullText += pageText + '\n\n'
    }

    return fullText.trim()
  } catch (error: any) {
    console.error('Erro ao extrair texto do PDF:', error.message)
    throw new Error(`Falha ao processar PDF: ${error.message}`)
  }
}

/**
 * Baixa e extrai texto de um PDF do Supabase Storage
 * @param supabase Cliente do Supabase
 * @param filePath Caminho do arquivo no storage
 * @returns Texto extraído do PDF
 */
export async function extractTextFromSupabasePDF(
  supabase: any,
  filePath: string
): Promise<{ text: string; success: boolean; error?: string }> {
  try {
    console.log(`📄 Baixando PDF: ${filePath}`)

    // Baixar arquivo do Supabase Storage
    const { data, error } = await supabase.storage
      .from('candidatos')
      .download(filePath)

    if (error) {
      console.error(`❌ Erro ao baixar PDF do Supabase:`, error)
      return {
        text: '',
        success: false,
        error: `Erro ao baixar arquivo: ${error.message}`
      }
    }

    if (!data) {
      return {
        text: '',
        success: false,
        error: 'Arquivo não encontrado no storage'
      }
    }

    // Converter Blob para Buffer
    const arrayBuffer = await data.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    console.log(`📦 PDF baixado, tamanho: ${buffer.length} bytes`)

    // Extrair texto
    const text = await extractTextFromPDF(buffer)

    console.log(`✅ Texto extraído do PDF: ${text.length} caracteres`)

    return {
      text,
      success: true
    }

  } catch (error: any) {
    console.error(`❌ Erro ao processar PDF:`, error)
    return {
      text: '',
      success: false,
      error: error.message
    }
  }
}
