const express = require('express');
const app = express();
const { v4: uuidv4 } = require('uuid');
const { uuid, isUuid } = require('uuidv4');

const projects = [];

app.use(express.json()); //Para adicionar alguma função onde todas as rotas vão ter que passar por ela

//Middleware, todas as rotas podem ser consideradas middlewares.
function logRequest(request, response, next){
    const {method, url} = request;
    const logLabel = `[${method.toUpperCase()}] ${url}`; //USAR CRASE ` TECLADO: SHIFT + '
    
    console.log(logLabel);
    return next(); //Se o Next não for chamado no final do middleware o próximo middleware não será disparada (o próximo middleware é o "app.use(logRequest);" logo abaixo).
    //Devo usar o Next quando não quero interromper o restante da aplicação.
};

function validateProjectID(request, response, next){
    const {id} = request.params;

    if (!isUuid(id)){
        return response.status(400).json({error: 'Invalid project ID.'});
    };
    return next();
};

app.use(logRequest);
app.use('/projects/:id', validateProjectID);

/*Utilizado para visualizar acessos das rotas. O './projects'
*é qual endereço quer ser observado.
*Quem dá o return é sempre o parametro response.
*/
//GET É PARA BUSCAR UMA INFORMAÇÃO
app.get('/projects', (request, response) => { //request é quem guarda as informações da requisição que o usuário está fazendo
    const {title} = request.query; //Aula notion Tipos de Parâmetros - item Query Params
    
    const results = title
        ? projects.filter(project => project.title.includes(title))
        : projects;
    
    return response.json (results); //o JSON sempre vai retornar um array ou um objeto 
});
//POST É PARA CRIAR UMA INFORMAÇÃO
app.post('/projects', (request, response) => {
    const {title, owner} = request.body; //Aula notion Tipos de Parâmetros - item Body Params
    const project = {id: uuid(), title, owner};

    projects.push(project); //Aqui chamo o array de projects e adiciono este project no array

    return response.json(project); //Aqui estou exibindo o projeto recém criado nas linhas anteriores
});
//PUT É PARA ALTERAR UMA INFORMAÇÃO
app.put('/projects/:id', (request, response) => {//A informação :id é para informar qual projeto específico quero alterar
    const {id} = request.params; //Aula notion Tipos de Parâmetros - item Route Params, pode ser usado tanto para atualização quanto delete
    const {title, owner} = request.body;

    const projectIndex = projects.findIndex(project => project.id === id); //Percorre o array para localizar o projeto desejado
    
    if (projectIndex < 0){//Altera a informação desejada
        return response.status(400).json({error: ('Project not found.')});//O item status(400) se refere ao item Conceitos API REST > HTTP codes
    };
    
    const project = { //Estou criando o objeto de projeto novamente
        id,
        title,
        owner,
    };
    projects[projectIndex] = project; //Estou substituindo a possição do array selecionada anteriormente pelo novo projeto criado na linha anterior
    return response.json (project);
});
//DELETE É PARA DELETAR UMA INFORMAÇÃO
app.delete('/projects/:id', (request, response) => {//A informação :id é para informar qual projeto específico quero deletar
    const {id} = request.params;
    const projectIndex = projects.findIndex(project => project.id === id); //Percorre o array para localizar o projeto desejado
    
    if (projectIndex < 0){//Altera a informação desejada
        return response.status(400).json({error: ('Project not found.')});//O item status(400) se refere ao item Conceitos API REST > HTTP codes
    };

    projects.splice(projectIndex, 1); //O 1 informa quantas informações quero remover, neste caso 1 se refere apenas a informação contida no índice selecionado

    return response.status(204).send(); //O método send fará que o retorno seja em branco. O status 204 é indicado para retorno vazio.
});
//Necessário definir uma porta a qual o código será acessado
app.listen(3333, () => {
    console.log('Back-end started!');
});