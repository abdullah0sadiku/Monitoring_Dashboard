const express = require('express');
const axios = require('axios');
const router = express.Router();

// GET /api/github/repositories
// Fetch user's GitHub repositories
router.post('/repositories', async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'GitHub access token is required'
      });
    }

    // Fetch repositories from GitHub API
    const response = await axios.get('https://api.github.com/user/repos', {
      headers: {
        'Authorization': `token ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      params: {
        sort: 'updated',
        per_page: 100
      }
    });

    // Filter and format repositories
    const repositories = response.data.map(repo => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      html_url: repo.html_url,
      clone_url: repo.clone_url,
      ssh_url: repo.ssh_url,
      private: repo.private,
      default_branch: repo.default_branch,
      language: repo.language,
      updated_at: repo.updated_at
    }));

    res.json({
      success: true,
      repositories: repositories
    });
  } catch (error) {
    console.error('GitHub API error:', error.message);
    
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data.message || 'GitHub API error';
      
      if (status === 401) {
        return res.status(401).json({
          success: false,
          message: 'Invalid GitHub access token'
        });
      }
      
      if (status === 403) {
        return res.status(403).json({
          success: false,
          message: 'GitHub API rate limit exceeded or insufficient permissions'
        });
      }
      
      return res.status(status).json({
        success: false,
        message: message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch GitHub repositories'
    });
  }
});

// GET /api/github/repo/:owner/:repo/contents/:path
// Fetch repository file contents
router.post('/repo/contents', async (req, res) => {
  try {
    const { accessToken, owner, repo, path, branch = 'main' } = req.body;

    if (!accessToken || !owner || !repo || !path) {
      return res.status(400).json({
        success: false,
        message: 'Access token, owner, repo, and path are required'
      });
    }

    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      headers: {
        'Authorization': `token ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      params: {
        ref: branch
      }
    });

    // Decode content if it's base64 encoded
    let content = response.data.content;
    if (response.data.encoding === 'base64') {
      content = Buffer.from(content, 'base64').toString('utf-8');
    }

    res.json({
      success: true,
      file: {
        name: response.data.name,
        path: response.data.path,
        content: content,
        size: response.data.size,
        type: response.data.type,
        sha: response.data.sha
      }
    });
  } catch (error) {
    console.error('GitHub file fetch error:', error.message);
    
    if (error.response && error.response.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'File not found in repository'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch file from GitHub'
    });
  }
});

// PUT /api/github/repo/contents
// Update repository file contents
router.put('/repo/contents', async (req, res) => {
  try {
    const { accessToken, owner, repo, path, content, message, branch = 'main', sha } = req.body;

    if (!accessToken || !owner || !repo || !path || !content || !message) {
      return res.status(400).json({
        success: false,
        message: 'Access token, owner, repo, path, content, and message are required'
      });
    }

    const requestData = {
      message: message,
      content: Buffer.from(content).toString('base64'),
      branch: branch
    };

    // Include SHA if provided (for updates)
    if (sha) {
      requestData.sha = sha;
    }

    const response = await axios.put(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      requestData,
      {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    res.json({
      success: true,
      commit: {
        sha: response.data.commit.sha,
        message: response.data.commit.message,
        url: response.data.commit.html_url
      }
    });
  } catch (error) {
    console.error('GitHub file update error:', error.message);
    
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data.message || 'GitHub API error';
      
      if (status === 409) {
        return res.status(409).json({
          success: false,
          message: 'File has been modified. Please provide the latest SHA.'
        });
      }
      
      return res.status(status).json({
        success: false,
        message: message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update file in GitHub'
    });
  }
});

// GET /api/github/repo/:owner/:repo/branches
// Fetch repository branches
router.post('/repo/branches', async (req, res) => {
  try {
    const { accessToken, owner, repo } = req.body;

    if (!accessToken || !owner || !repo) {
      return res.status(400).json({
        success: false,
        message: 'Access token, owner, and repo are required'
      });
    }

    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/branches`, {
      headers: {
        'Authorization': `token ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    const branches = response.data.map(branch => ({
      name: branch.name,
      commit: {
        sha: branch.commit.sha,
        url: branch.commit.url
      },
      protected: branch.protected
    }));

    res.json({
      success: true,
      branches: branches
    });
  } catch (error) {
    console.error('GitHub branches fetch error:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch repository branches'
    });
  }
});

// POST /api/github/repo/validate
// Validate repository access and scraper script
router.post('/repo/validate', async (req, res) => {
  try {
    const { accessToken, repoUrl, scriptPath, branch = 'main' } = req.body;

    if (!accessToken || !repoUrl || !scriptPath) {
      return res.status(400).json({
        success: false,
        message: 'Access token, repository URL, and script path are required'
      });
    }

    // Extract owner and repo from URL
    const repoMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!repoMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid GitHub repository URL'
      });
    }

    const [, owner, repo] = repoMatch;

    // Check repository access
    const repoResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'Authorization': `token ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    // Check if script file exists
    try {
      const fileResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/${scriptPath}`, {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        },
        params: {
          ref: branch
        }
      });

      // Basic validation of scraper script
      let content = fileResponse.data.content;
      if (fileResponse.data.encoding === 'base64') {
        content = Buffer.from(content, 'base64').toString('utf-8');
      }

      const validation = {
        hasRequests: /import requests|from requests/.test(content),
        hasBeautifulSoup: /from bs4 import|import bs4/.test(content),
        hasSelenium: /from selenium import|import selenium/.test(content),
        hasMainFunction: /def main|if __name__ == "__main__"/.test(content),
        fileSize: fileResponse.data.size,
        language: content.includes('def ') ? 'python' : 'unknown'
      };

      res.json({
        success: true,
        repository: {
          name: repoResponse.data.name,
          full_name: repoResponse.data.full_name,
          private: repoResponse.data.private,
          default_branch: repoResponse.data.default_branch,
          language: repoResponse.data.language
        },
        script: {
          path: scriptPath,
          exists: true,
          size: fileResponse.data.size,
          validation: validation
        }
      });
    } catch (fileError) {
      if (fileError.response && fileError.response.status === 404) {
        return res.json({
          success: false,
          message: 'Script file not found in repository',
          repository: {
            name: repoResponse.data.name,
            full_name: repoResponse.data.full_name,
            private: repoResponse.data.private,
            default_branch: repoResponse.data.default_branch,
            language: repoResponse.data.language
          },
          script: {
            path: scriptPath,
            exists: false
          }
        });
      }
      throw fileError;
    }
  } catch (error) {
    console.error('GitHub validation error:', error.message);
    
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data.message || 'GitHub API error';
      
      if (status === 401) {
        return res.status(401).json({
          success: false,
          message: 'Invalid GitHub access token'
        });
      }
      
      if (status === 404) {
        return res.status(404).json({
          success: false,
          message: 'Repository not found or access denied'
        });
      }
      
      return res.status(status).json({
        success: false,
        message: message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to validate repository'
    });
  }
});

module.exports = router; 