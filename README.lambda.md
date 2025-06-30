# AWS Lambda

Para executar este projeto como uma função `AWS Lambda`:

* Executar o script NPM "lambda" pelo VSCode ou com o comando `npm run lambda`
* O projeto será empacotado no arquivo `dist/lambda/index.mjs`
* Este arquivo deverá ser zipado e carregado na função `AWS Lambda`

##

- Create function
  - Function name: tenant-[tenant]
  - **Create function**
- Upload from > .zip file
  - Select .zip file
  - **Upload**
- Aliases > Create alias
  - Name: current
  - Version: $LATEST
- Alias: current > Function URL
  - Create function URL
    - Auth type: NONE
    - **Save**
- Configuration > General configuration
  - **IMPORTANTE**
  - Timeout: 1m
  - Memory: ?
- Configuration > Environment variables
  - Add variable **token**
