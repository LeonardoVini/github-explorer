import React, { useState, useEffect, FormEvent } from 'react';
import { FiChevronRight, FiChevronUp } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import api from '../../services/api';

import logoImg from '../../assets/logo.svg';

import { Title, Form, Repositories, Error, Button } from './styles';

interface Repository {
  full_name: string;
  description: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

const Dashboard: React.FC = () => {
  const [newRepo, setNewRepo] = useState('');
  const [inputError, setInputError] = useState('');
  const [repositories, setRepositories] = useState<Repository[]>(() => {
    const storagedRepositories = localStorage.getItem(
      '@GithubExplorer:repositories',
    );

    if (storagedRepositories) {
      return JSON.parse(storagedRepositories);
    }

    return [];
  });

  useEffect(() => {
    localStorage.setItem(
      '@GithubExplorer:repositories',
      JSON.stringify(repositories),
    );
  }, [repositories]);

  async function handleAddRepository(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    if (!newRepo) {
      setInputError('Digite o autor/nome do repositório');
      return;
    }

    const repoExists = repositories.filter((e) => e.full_name === newRepo);

    if (repoExists.length) {
      setInputError('Repositório já adicionado');
      return;
    }

    try {
      const response = await api.get<Repository>(`repos/${newRepo}`);

      const repository = response.data;

      setRepositories([...repositories, repository]);
      setNewRepo('');
      setInputError('');

      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    } catch (error) {
      setInputError('Erro na busca por esse repositório');
    }
  }

  function handleDeleteRepository(repoFullName: string): void {
    const index = repositories.findIndex((e) => e.full_name === repoFullName);

    setRepositories([...repositories.filter((e, i) => i !== index)]);
  }

  function handleScrollToTop(): void {
    window.scrollTo({ top: -document.body.scrollHeight, behavior: 'smooth' });
  }

  return (
    <>
      <img src={logoImg} alt="Github Explorer" />
      <Title>Explore repositórios no Github.</Title>

      <Form hasError={!!inputError} onSubmit={handleAddRepository}>
        <input
          type="text"
          value={newRepo}
          onChange={(e) => setNewRepo(e.target.value)}
          placeholder="Digite o nome do repositório"
        />
        <button type="submit">Pesquisar</button>
      </Form>

      {inputError && <Error>{inputError}</Error>}

      <Repositories>
        {repositories.map((repository) => (
          <div id="repository-container" key={repository.full_name}>
            <Link to={`/repository/${repository.full_name}`}>
              <img
                src={repository.owner.avatar_url}
                alt={repository.owner.login}
              />
              <div>
                <strong>{repository.full_name}</strong>
                <p>{repository.description}</p>
              </div>

              <FiChevronRight size={20} />
            </Link>

            <button
              onClick={() => handleDeleteRepository(repository.full_name)}
              type="button"
            >
              X
            </button>
          </div>
        ))}
      </Repositories>

      <Button type="button" onClick={handleScrollToTop}>
        <FiChevronUp size={24} />
      </Button>
    </>
  );
};

export default Dashboard;
