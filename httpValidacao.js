import fs from 'fs/promises';
import chalk from 'chalk';

const regex = /\[([^\]]*)\]\((https?:\/\/[^$#\s].[^\s]*)\)/g;

function extrairLinks(texto) {
    const resultados = [];
    let match;

    while ((match = regex.exec(texto)) !== null) {
        resultados.push({
            nome: match[1],
            url: match[2]
        });
    }

    return resultados;
}

// 🔍 validação dos links adicionados ao arquivo.md
async function validarLink(url) {
    try {
        const resposta = await fetch(url, { method: 'HEAD' });
        return resposta.status;
    } catch {
        return 'erro';
    }
}

async function processarArquivo(caminho) {
    try {
        const dados = await fs.readFile(caminho, 'utf-8');
        const links = extrairLinks(dados);

        if (links.length === 0) {
            console.log(chalk.yellow('Nenhuma referência encontrada.'));
            return;
        }

        // acessa cada link e tenta validar de forma a mostrar qual esta funcionando
        for (const link of links) {
            const status = await validarLink(link.url);
            
            //If e else mostra em cores o status da validação
            if (status === 200) {
                //se a referencia estiver Ok ele mostra em verde no terminal
                console.log(
                    chalk.green(`Referência: ${link.nome}`) +
                    chalk.white(' | ') +
                    chalk.blue(link.url)
                );
            } else if (status === 'erro') {
                console.log(
                    //se a referencia estiver vermelho mostra uma mensagem de erro ao acessar
                    chalk.red(`Referência: ${link.nome}`) +
                    chalk.white(' | ') +
                    chalk.red('Erro ao acessar')
                );
            } else {
                console.log(
                    //se a referencia estiver em amarelo mostra uma mensasagem, de error e o numero
                    chalk.yellow(`Referência: ${link.nome}`) +
                    chalk.white(' | ') +
                    chalk.yellow(`Status: ${status}`)
                );
            }
        }

    } catch (erro) {
        console.log(chalk.bgRed.white(' ERRO: Arquivo não encontrado '));
        console.error(erro.message);
    }
}
//le o arquivo projetoMetadados.md
processarArquivo('./arquivos/projetoMetadados.md');