"""Main program to consume FMC vehicle position service.
Examples:
  $python main.py -h.
  $python main.py url_token url_data client_id client_secret --outdir . --outfilename result.json.
"""
import os
import sys
import argparse
import gettext
import logging
import json
# add top level package to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.realpath(__file__)))))
# pylint: disable=wrong-import-position
from pyprograms.commons.oauth_client import (
    OAuthClientManager, OAuthClientManagerError, OAuthClientService, OAuthClientCredentials
)
from pyprograms.commons.time import TimeManager, get_str_time
from pyprograms.commons.file import FileManager, FileManagerError
# pylint: enable=wrong-import-position
_ = gettext.gettext
logger = logging.getLogger(__name__)  # pylint: disable=C0103

def get_args():
    """ Return arguments from input. """
    parser = argparse.ArgumentParser(
        description=_(
            'Retrieves vehicles position information from FMC API.'
        )
    )
    parser.add_argument('url_token', help=_('url for token request'))
    parser.add_argument('url_data', help=_('url for data request'))
    parser.add_argument('client_id', help=_('client id'))
    parser.add_argument('client_secret', help=_('client secret'))
    parser.add_argument(
        '--outdir',
        default='.',
        help=_('output folder')
    )
    parser.add_argument(
        '--outfilename',
        default='result.json',
        help=_('output file name')
    )
    args = parser.parse_args()
    return args


def init_logging():
    """ Helper function to initialize logging."""
    logger.setLevel(logging.INFO)
    # create a file handler
    handler = logging.FileHandler('{}.log'.format(get_str_time()))
    handler.setLevel(logging.INFO)
    # create a logging format
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    # add the file handler to the logger
    logger.addHandler(handler)


def init_file_manager(out_dir):
    """ Helper function to initialize the file manager, and create output folders.
    Args:
      out_dir: Folder path to output result files.
    Returns:
      A FileManager object to handle all file and folder operations.
    """
    fman = None
    try:
        fman = FileManager(out_dir, '.')
    except FileManagerError as err:
        logger.error('%s: %s', _('ERROR'), str(err), exc_info=True)
        fman = None
    return fman


def init_oauth_client_manager(url_token, url_data, client_id, client_secret):
    """ Helper function to initialize the oauth client manager.
    Args:
      url_token: URL for token request.
      url_data: URL for data request.
      client_id: ID of the client.
      client_secret: Secret of the client.
    Returns:
      A OAuthClientManager object to handle service request operations.
    """
    oman = None
    try:
        oman = OAuthClientManager(
            OAuthClientService(url_token, url_data),
            OAuthClientCredentials(client_id, client_secret)
        )
    except OAuthClientManagerError as err:
        logger.error('%s: %s', _('ERROR'), str(err), exc_info=True)
        oman = None
    return oman


def process(oman):
    """ Helper function to initialize the oauth client manager.
    Args:
      oman: OAuthClientManager object.
    Returns:
      A json object.
    """
    try:
        return json.dumps(oman.request_data())
    except (OAuthClientManagerError, TypeError) as err:
        logger.error('%s: %s', _('ERROR'), str(err), exc_info=True)
    return None


def main():
    """Main procedure."""
    init_logging()
    args = get_args()
    fman = init_file_manager(args.outdir)
    if not fman:
        sys.exit()
    tman = TimeManager()

    # notify user that program starts
    print('{}.'.format(_('START')))
    logger.info('%s.', _('START'))

    # establish connection
    print('{} {}...'.format(_('Initializing'), _('Connection')))
    logger.info('%s %s...', _('Initializing'), _('Connection'))
    oman = init_oauth_client_manager(
        args.url_token, args.url_data, args.client_id, args.client_secret
    )
    status = _('Succeeded')
    if not oman:
        status = _('Failed')
    print('{} {}'.format(_('Connection'), status))
    logger.info('%s %s', _('Connection'), status)

    # request data
    if oman:
        print('{} {}...'.format(_('Initializing'), _('Request')))
        logger.info('%s %s...', _('Initializing'), _('Request'))
        result = process(oman)
        status = _('Succeeded')
        if not result:
            status = _('Failed')
        print('{} {}'.format(_('Request'), status))
        logger.info('%s %s', _('Request'), status)

    # output result
    tman.end()
    fman.write_txt_file(args.outfilename, result)

    # notify user that program ends
    print('{}.'.format(_('END')))
    logger.info('%s.', _('END'))


if __name__ == '__main__':
    main()
