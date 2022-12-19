# File Manager

## Description

The file manager should is able to do the following:

- Work using CLI
- Perform basic file operations (copy, move, delete, rename, etc.)
- Utilize Streams API
- Get information about the host machine operating system
- Perform hash calculations
- Compress and decompress files

## Technical requirements

- Use 18 LTS version of Node.js

## Technical requirements
- The program is started by npm-script `start` in following way:
```bash
npm start -- --username=your_username
```
- Use `ctrl + c` pressed or sent `.exit` command into console to finish work
- Starting working directory is current user's home directory (for example, on Windows it's something like `system_drive/Users/Username`)
- By default program should prompt user in console to print commands and wait for results  
- In case of unknown operation or invalid input (missing mandatory arguments, wrong data in arguments, etc.) `Invalid input` message should be shown and user should be able to enter another command
- In case of error during execution of operation `Operation failed` message should be shown and user should be able to enter another command (e.g. attempt to perform an operation on a non-existent file or work on a non-existent path should result in the operation fail)
- User can't go upper than root directory (e.g. on Windows it's current local drive root). If user tries to do so, current working directory doesn't change  

## List of operations and their syntax:
- Navigation & working directory (nwd)
    - Go upper from current directory (when you are in the root folder this operation shouldn't change working directory)  
    ```bash
    up
    ```
    - Go to dedicated folder from current directory (`path_to_directory` can be relative or absolute)
    ```bash
    cd path_to_directory
    ```
    - Print in console list of all files and folders in current directory. List should contain:
        - list should contain files and folder names (for files - with extension)
        - folders and files are sorted in alphabetical order ascending, but list of folders goes first
        - type of directory content should be marked explicitly (e.g. as a corresponding column value)
    ```bash
    ls
    ```

- Basic operations with files
    - Read file and print it's content in console: 
    ```bash
    cat path_to_file
    ```
    - Create empty file in current working directory: 
    ```bash
    add new_file_name
    ```
    - Rename file (content should remain unchanged): 
    ```bash
    rn path_to_file new_filename
    ```
    - Copy file: 
    ```bash
    cp path_to_file path_to_new_directory
    ```
    - Move file: 
    ```bash
    mv path_to_file path_to_new_directory
    ```
    - Delete file: 
    ```bash
    rm path_to_file
    ```
- Operating system info (prints following information in console)
    - Get EOL (default system End-Of-Line) and print it to console  
    ```bash
    os --EOL
    ```
    - Get host machine CPUs info (overall amount of CPUS plus model and clock rate (in GHz) for each of them) and print it to console  
    ```bash
    os --cpus
    ```
    - Get home directory and print it to console  
    ```bash
    os --homedir
    ```
    - Get current *system user name* (Do not confuse with the username that is set when the application starts) and print it to console  
    ```bash
    os --username
    ```
    - Get CPU architecture for which Node.js binary has compiled and print it to console  
    ```bash
    os --architecture
    ```
- Hash calculation  
    - Calculate hash for file and print it into console  
    ```bash
    hash path_to_file
    ```
- Compress and decompress operations  
    - Compress file (using Brotli algorithm)  
    ```bash
    compress path_to_file path_to_destination*
    ```
    - Decompress file (using Brotli algorithm)  
    ```bash
    decompress path_to_file path_to_destination*
    ```
    <i>*where path_to_destination should contain the name of new file or could be empty.
    If it's empty, manager will create file in the current working directory with the filename looks like source_filename.br</i>
    
    NB! After decompressing of previously compressed file result should not differ with originally compressed file
    
