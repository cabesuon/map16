"""Util module that contains the tools to manage oauth requests of a program.
Classes:
  OAuthClientManagerError.
  OAuthClientManager.
"""
import os
import sys
import errno
import gettext
import logging
import json
from oauthlib.oauth2 import BackendApplicationClient
from requests_oauthlib import OAuth2Session


class OAuthClientManagerError(Exception):
    """Exception for OAuthClientManager."""


class OAuthClientService:  # pylint: disable=R0903
    """Class for oauth client service parameters.
    Attributes:
      url_token: URL for token request.
      url_data: URL for data request.
    """

    def __init__(
        self,
        url_token=None,
        url_data=None
    ):
        self.url_token = url_token
        self.url_data = url_data


class OAuthClientCredentials:  # pylint: disable=R0903
    """Class for oauth client credentials.
    Attributes:
      id: ID of the client.
      secret: Secret of the client.
    """

    def __init__(
        self,
        client_id=None,
        client_secret=None,
    ):
        self.client_id = client_id
        self.client_secret = client_secret


class OAuthClientManager:
    """Class to manage input/output files of a control.
    Attributes:
        service: Service urls parameters.
        credentials: Client credentials parameters.
        logger: Logging object.
    """

    def __init__(self, service, credentials, logger=None):
        # parameters
        self.service = service
        self.credentials = credentials
        self.logger = logger or logging.getLogger(__name__)
        # internal
        self._ = gettext.gettext
        self._token = None
        try:
            self._client = BackendApplicationClient(client_id=self.credentials.client_id)
            self._session = OAuth2Session(client=self._client)
            self._fetch_token()
        except:
            e = sys.exc_info()[0]
            self.logger.error(e)
            raise OAuthClientManagerError(self._('Failed to request token'))

    def _fetch_token(self):
        """Helper method to fetch the token."""
        self._session.fetch_token(
            token_url=self.service.url_token,
            client_id=self.credentials.client_id,
            client_secret=self.credentials.client_secret
        )

    def request_data(self):
        """Request the service data.
        Output:
          data: result data of the sevice request.
        """
        try:
            r = self._session.get(self.service.url_data)
            return r.json()
        except:
            raise OAuthClientManagerError(self._('Failed to request data'))
