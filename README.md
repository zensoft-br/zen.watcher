# Projeto zen.watcher

O projeto zen.watcher é uma solução inovadora destinada à integração com o Zen ERP, facilitando a criação de observadores de eventos. Com esta ferramenta, é possível monitorar e responder a eventos gerados pelas interações com a API do Zen ERP, promovendo uma automação eficiente e uma gestão de processos mais ágil.

## Funcionalidades principais

### Observação de eventos

Cada ação realizada através dos endpoints da API do Zen ERP dispara um evento específico, que possui um nome correspondente ao ponto de acesso do endpoint executado. Isso permite que os observadores de eventos sejam configurados para escutar e reagir a estas atividades em tempo real.

Aqui estão alguns exemplos de como os eventos são nomeados e disparados em resposta às operações na API:

* Ao criar uma venda pelo endpoint `POST /sale/sale`, um evento `/sale/saleCreate` é disparado
* Ao alterar uma venda pelo endpoint `PUT /sale/sale`, um evento `/sale/saleUpdate` é disparado
* Ao excluir uma venda pelo endpoint `DELETE /sale/sale` um evento `/sale/saleDelete` é disparado
* Operações de preparação de vendas, através do endpoint `POST /sale/saleOpPrepare`, emitem o evento `/sale/saleOpPrepare`
* Operações de aprovação de vendas, através do endpoint `POST /sale/saleOpApprove`, emitem o evento `/sale/saleOpApprove`

### Aplicação dos observadores

Os observadores configurados podem realizar uma ampla gama de ações em resposta aos eventos, incluindo, mas não se limitando a:

* Alteração de dados para manutenção da integridade e atualização de informações
* Automação de processos para aumentar a eficiência operacional
* Realização de validações para garantir a conformidade e a qualidade dos dados
* Bloqueio de operações que não atendem a critérios específicos
* Envio de notificações para manter as partes interessadas informadas sobre mudanças importantes

### Acesso à API

Para mais detalhes sobre como utilizar a API e configurar os observadores de eventos, acesse a documentação completa da API disponível:

- Menu > Sistema > Informações do sistema
  - API

## Funcionamento do projeto zen.watcher

O projeto Zen.Watcher é projetado para operar como um serviço web, oferecendo uma abordagem prática e eficiente para monitorar eventos no Zen ERP. O cerne desta funcionalidade reside na capacidade de detectar e responder a eventos específicos em tempo real, utilizando para isso o script `watcher.js`.

### Mecanismo de observação de eventos

Quando um evento é disparado no Zen ERP, a função `watch` dentro de `watcher.js` é acionada. Esta função é projetada para receber um argumento crucial: um objeto `zenReq`, que encapsula detalhes significativos sobre o evento ocorrido. A estrutura deste objeto é meticulosamente definida para fornecer uma visão abrangente do evento, incluindo:

* **method**: Identifica o tipo de solicitação feita (e.g., POST, PUT).
* **path**: O endpoint acessado que resultou no evento.
* **query**: Parâmetros de consulta que podem acompanhar a solicitação.
* **headers**: Informações sobre o tipo de conteúdo e outras metadatas da solicitação.
* **body**: Contém informações essenciais sobre o evento do Zen Erp, incluindo:
  * **context**: O contexto em que o evento ocorreu
    * **tenant** O tenant (locatário) sob o qual o evento ocorreu.
    * **event** O evento específico que foi disparado.
    * **token** Um token JWT para autenticação e autorização.
  * **args** Argumentos adicionais que podem incluir identificadores e dados relevantes ao evento.

Exemplo `zenReq`:

```json
{
  "method": "POST",
  "path": "/",
  "query": {
    "p1": "v1",
    "p2": "v2"
  },
  "headers": {
    "content-type": "application/json"
  },
  "body": {
    "context": {
      "tenant": "tenant",
      "event": "/module/operation",
      "token": "jwt"
    },
    "args": {
      "id": 9999,
      "bean": {
        "id": 9999,
      }
    }
  }
}
```

### Análise e resposta aos eventos

A função `watch` utiliza a estrutura `zenReq` para analisar detalhadamente o evento. Isso envolve uma compreensão do tipo de operação realizada, os dados envolvidos e o contexto sob o qual a operação foi executada. A partir dessa análise, o script pode:

* Executar validações para garantir que a operação atenda a critérios pré-estabelecidos.
* Modificar dados em resposta ao evento, seja para atualização de registros, correção de informações ou qualquer outra forma de manutenção de dados.
* Automatizar processos subsequentes que dependam do evento observado, como disparar outras ações, iniciar workflows ou enviar notificações.
* Impedir operações que não se alinhem às políticas ou regras de negócio estabelecidas, garantindo assim a integridade e a segurança dos processos empresariais.

## Como executar

Para colocar o projeto `zen.watcher` em funcionamento no ambiente local, um procedimento simples e direto é necessário. O primeiro passo é iniciar o serviço web por meio do comando específico no terminal ou prompt de comando. Este comando prepara o sistema para monitorar eventos e responder a eles de forma eficaz.

### Inicializando o webservice

#### Comando para execução:

```
node .\express.js
```

Ao executar este comando, o webservice é ativado na porta `8090`. A partir deste momento, o observador está apto a receber requisições através desta porta, independentemente do verbo HTTP utilizado, do caminho especificado na URL ou dos parâmetros de consulta enviados. Todas essas informações serão capturadas e organizadas no objeto `zenReq`, que serve como a base para a análise e resposta aos eventos.

### Exemplo Prático de Requisição

Suponha que o webservice esteja operacional no endereço IP `10.0.0.10`. Ao realizar uma requisição para o endpoint `http://10.0.0.10:8090/pasta1/pasta2?p1=v1&p2=v2`, o seguinte objeto `zenReq` é gerado para encapsular os detalhes da requisição:

```json
{
  "method": "GET",
  "path": "/pasta1/pasta2",
  "query": {
    "p1": "v1",
    "p2": "v2"
  },
  "headers": {
    "content-type": "application/json"
    // Outros cabeçalhos presentes na requisição
  },
  "body": {
    // O corpo da requisição, se aplicável
  }
}
```

## Configuração do monitoramento de enventos no Zen Erp

Para configurar o monitoramento de eventos e garantir que ações automáticas sejam realizadas em resposta a eventos específicos, siga o procedimento abaixo. Esse processo envolve a inclusão de observadores de eventos através da interface de usuário do Zen ERP, definindo quais eventos devem ser monitorados e como o sistema deve reagir a eles.

### Acessando a configuração de observadores

Acesse `Menu > Sistema > Automação > Observadores`. Esta seção é dedicada à configuração e gestão de observadores de eventos.

Dentro da área de observadores, localize e utilize a opção para Incluir um novo observador. Esta ação permite que você defina um novo conjunto de regras para o monitoramento de eventos específicos.

Durante o processo de inclusão de um novo observador, você será solicitado a fornecer informações cruciais para a configuração:

* **Nome do evento**: Especifique o nome do evento que deseja monitorar. Este nome deve corresponder exatamente ao evento que, quando ocorrer dentro do Zen ERP, acionará a chamada ao endpoint configurado.

* **Endpoint de chamada**: Informe o endpoint que deverá ser chamado quando o evento especificado ocorrer. Isso inclui tanto o path quanto, se aplicável, os query params. Essa definição é vital para assegurar que a ação correta seja executada em resposta ao evento.
