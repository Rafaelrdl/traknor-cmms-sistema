# Testes do Projeto TrakNor CMMS

Este diretório contém todos os testes organizados do projeto.

## Estrutura de Testes

### 📁 manual/
Testes manuais e documentação de teste:
- `RESPONSIVE_NAV_TESTS.md` - Testes de navegação responsiva
- `teste-convites.html` - Página de teste para sistema de convites

### 📁 unit/ (futuro)
Testes unitários organizados por módulo.

### 📁 integration/ (futuro)
Testes de integração entre componentes.

### 📁 e2e/ (futuro)
Testes end-to-end automatizados.

## Executando Testes

Para executar os testes automatizados:
```bash
npm test
```

Para executar testes específicos:
```bash
npm test -- --grep "nome-do-teste"
```

## Contribuindo com Testes

- Adicione testes manuais e documentação em `manual/`
- Organize testes unitários em `unit/` por módulo
- Coloque testes de integração em `integration/`
- Use `e2e/` para testes completos do sistema
