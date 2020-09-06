"""Util module that contains the tools to manage input/output files of a program.
Functions:
  read_json_file.
  get_files_path.
Classes:
  FileManagerError.
  FileManager.
"""
import os
import errno
import csv
import gettext
import logging
import json


def read_json_file(file_name):
    """Read a JSON file.
    Args:
      file_name: Name of the file.
    Returns:
      JSON object.
    """
    if not file_name:
        return None
    data = None
    if os.path.isfile(file_name):
        with open(file_name) as json_data:
            data = json.load(json_data)
    return data


def get_files_path(start_dir, file_type, recursive=False):
    """Returns the list of files path of a start folder.
    Args:
      start_dir: Name of the start folder.
      recursive: Boolean indicating if it should explore sub folders.
      format: Name of the files format.
    Returns:
      List of files path.
    """
    files = []
    fext = '.{}'.format(file_type)
    if not recursive:
        files = [
            os.path.join(start_dir, fname) for fname in os.listdir(start_dir)
            if os.path.isfile(os.path.join(start_dir, fname)) and fname.endswith(fext)
        ]
    else:
        for root, _, dir_files in os.walk(start_dir):
            files.extend([os.path.join(root, fname)
                          for fname in dir_files if fname.endswith(fext)])
    return files


class FileManagerError(Exception):
    """Exception for FileManager."""


class FileManager:
    """Class to manage input/output files of a control.
    Attributes:
        output_dir: Folder path for output files.
        logger: Logging object.
    """

    def __init__(self, output_dir, logger=None):
        # parameters
        self.output_dir = output_dir
        self.logger = logger or logging.getLogger(__name__)
        # internal
        self._ = gettext.gettext
        # check dirs
        try:
            os.makedirs(self.output_dir)
        except OSError as err:
            if err.errno != errno.EEXIST:
                raise FileManagerError(self._('Cannot create output dir'))

    def add_dir(self, dir_name):
        """Add a new folder to the output folder.
        Args:
          dir_name: Name of the folder to add.
        Returns:
          Full path of added folder.
        Raises:
          FileManagerError
        """
        path = os.path.join(self.output_dir, dir_name)
        try:
            os.makedirs(path)
        except OSError as err:
            if err.errno != errno.EEXIST:
                raise FileManagerError(
                    '{}. {}'.format(self._('Cannot add dir'),
                                    self._('Folder already exist'))
                )
        return path

    def get_dir(self, dir_name):
        """Return full path of a folder in output folder.
        Args:
        dir_name: Name of the folder.
        Returns:
        Full path of the folder.
        """
        return os.path.join(self.output_dir, dir_name)

    def _output_file_path(self, dir_name, file_name):
        """Helper method to return full path of a file in the output folder.
        Args:
        dir_name: Name of the folder.
        file_name: Name of the file.
        Returns:
        Full path of the file.
        """
        if dir_name:
            return os.path.join(self.get_dir(dir_name), file_name)
        return os.path.join(self.output_dir, file_name)

    def write_txt_file(self, file_name, data):
        """Write a text file to the output folder.
        Args:
          file_name: Name of the file.
          data: Data of the file.
        """
        with open(self._output_file_path(None, file_name), 'w', encoding='utf-8') as txtfile:
            txtfile.write(data)
