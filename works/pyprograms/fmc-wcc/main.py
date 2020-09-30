"""Main program to consume FMC API services.
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
    parser.add_argument(
        '--loglevel',
        default='ERROR',
        choices=['DEBUG', 'INFO', 'ERROR'],
        help=_('logging level')
    )
    args = parser.parse_args()
    return args


def init_logging(loglevel):
    """ Helper function to initialize logging."""
    level = logging.ERROR
    if loglevel == 'DEBUG':
        level = logging.DEBUG
    elif loglevel == 'INFO':
        level = logging.INFO
    logger.setLevel(level)
    # create a file handler
    handler = logging.FileHandler('{}.log'.format(get_str_time()))
    handler.setLevel(level)
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
    """ Helper function to process the request.
    Args:
      oman: OAuthClientManager object.
    Returns:
      A json string.
    """
    result = {}
    has_more = True
    pag_keys = ('hasMore', 'limit', 'offset', 'count', 'links')
    try:
        i = 1
        while has_more:
            logger.info('%s:%d.', _('Request'), i)
            i += 1
            # make request
            r = oman.request_data()
            logger.info('%s %s:[%s].', _('Response'), _('Keys'), ', '.join(r.keys()))
            # store data
            for k in r.keys():
                # check if is a paginition key
                if k in pag_keys:
                    continue
                # rules:
                # list values from same key are concatenated
                # last value is kept for non list values
                if k not in result or not isinstance(r[k], list):
                    result[k] = r[k]
                else:
                    result[k] = result[k] + r[k]
                if not isinstance(r[k], list):
                    logger.info(
                        '%s:%s - %s:%s.',
                        _('Key'),
                        k,
                        _('Result'),
                        str(result[k])
                    )
                else:
                    logger.info(
                        '%s:%s - %s %s:%d - %s:%d.',
                        _('Key'),
                        k,
                        _('Result'),
                        _('Count'),
                        len(r[k]),
                        _('Sum'),
                        len(result[k])
                    )
            # check if there are more results
            if all(k in r for k in pag_keys):
                if r['count'] < r['limit']:
                    link_next = None
                else:
                    link_next = next(x['href'] for x in r['links'] if x['rel'] == 'next')
                logger.info(
                    'Pagination - %s:%s - %s:%d - %s:%d - %s:%d - %s:%s.',
                    'hasMore',
                    str(r['hasMore']),
                    'limit',
                    r['limit'],
                    'offset',
                    r['offset'],
                    'count',
                    r['count'],
                    'next',
                    link_next
                )
                has_more = r['hasMore'] and link_next
                if has_more:
                    # update oauth manager data url
                    oman.service.url_data = link_next
            else:
                has_more = False
    except (OAuthClientManagerError, TypeError) as err:
        logger.error('%s: %s', _('ERROR'), str(err), exc_info=True)
    return json.dumps(result)


def main():
    """Main procedure."""
    args = get_args()
    init_logging(args.loglevel)
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
        print('{} {}...'.format(_('Initializing'), _('Requests')))
        logger.info('%s %s...', _('Initializing'), _('Requests'))
        result = process(oman)
        status = _('Succeeded')
        if not result:
            status = _('Failed')
        print('{} {}'.format(_('Requests'), status))
        logger.info('%s %s', _('Requests'), status)

    # output result
    tman.end()
    fman.write_txt_file(args.outfilename, result)

    # notify user that program ends
    print('{}.'.format(_('END')))
    logger.info('%s.', _('END'))


if __name__ == '__main__':
    main()
