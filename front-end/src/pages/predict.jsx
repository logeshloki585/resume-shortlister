import React, { useState } from 'react';
import NavbarComponent from "@/Components/Navbar";
import Footer from '@/Components/Footer';
import { Progress } from "@material-tailwind/react";
import axios from 'axios';
import * as xlsx from 'xlsx';

function predict() {

    const [files, setFiles] = useState([]);
    const [fileJD, setFileJD] = useState([]);
    const [fileExcel, setFileExcel] = useState([]);
    const [results, setResults] = useState([]);
    const [nextChange,setNextChange] = useState(false);
    const [predict,setPredict] = useState(false);
    const [jdEntity,setJdEntity] = useState({});
    const [excelCount, setExcelCount] = useState(0);

    const handleFileChange = (event) => {
        const selectedFiles = event.target.files;
        setFiles([...selectedFiles]);
      };

    
      const handleNext = () => {
        setNextChange(true);
      }

      const handleUploadJD = (event) => {
        const fileJD = event.target.files;
        setFileJD([...fileJD]);
      }

      const handleExcel = (event) => {
        const fileJD = event.target.files;
        setFileExcel([...fileJD]);
      }

      const handleExcelCount = (event) => {
        const count = event.target.value;
        setExcelCount(count);
      }

      const convertExcelToJson = async (excelFile) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const data = event.target.result;
                const workbook = xlsx.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = xlsx.utils.sheet_to_json(worksheet);
                
                // Map JSON array to key-value pairs
                const jsonKeyValuePairs = jsonData.map(row => {
                    const obj = {};
                    for (const key in row) {
                        obj[key] = row[key];
                    }
                    return obj;
                });
                
                resolve(jsonKeyValuePairs);
            };
            reader.onerror = (error) => {
                reject(error);
            };
            reader.readAsBinaryString(excelFile);
        });
    }
    
    
    

      const handleSubmit = async () => {
        setPredict(true);
        const formData = new FormData();
        formData.append('job_description', fileJD[0]);
        try {
            const response = await axios.post('http://localhost:5000/extractEntity', formData);
        const data = response.data;
        const processFilesSequentially = async (index) => {
            if (index < files.length) {
                const resumeFile = files[index];
                const resumeFormData = new FormData();
                resumeFormData.append('file', resumeFile);
                resumeFormData.append('job_description', data);
                try {
                    const resumeResponse = await axios.post('http://localhost:5000/upload', resumeFormData);
                    const responseData = resumeResponse.data;
                    setResults(prevResults => [...prevResults, { id: responseData.file_name, score: responseData.score }]);
                    // Call the function recursively for the next file
                    processFilesSequentially(index + 1);
                } catch (error) {
                    console.error('Error predicting resume:', error);
                }
            }
        };

        // Start processing files sequentially, starting from index 0
        processFilesSequentially(0);
        } catch (error) {
            console.error('Error predicting:', error);
        }
      }


    const sendTestLink = async () => {
        const sortedResults = [...results].sort((a, b) => b.score - a.score);
        const topResults = sortedResults.slice(0, excelCount);

        const excelData = await convertExcelToJson(fileExcel[0]);
      
        const dataToSend = {
            files: topResults,
            excelFile: excelData
        };
    
        try {
            const response = await axios.post('http://localhost:3000/api/sentlink', dataToSend);
            console.log(response.data);
        } catch (error) {
            console.error('Error sending test link:', error);
        }
    }
    
  return (
    <div>
        <div className="p-6">
            <NavbarComponent/>
        </div>
        {(predict===false)?
        <>
         {(nextChange===false)?
            <>
                <h1 className='text-[32px] uppercase font-bold ml-24 mt-5'>Upload resume</h1>
                {(files.length !==0)?<div className='ml-24 mt-4'>uploaded - {files.length} Files</div>:<></>}
                <div className='px-48 py-16'> 
                    <div class="flex items-center justify-center w-full">
                        <label for="dropzone-file" class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                            <div class="flex flex-col items-center justify-center pt-5 pb-6">
                                <svg class="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                                </svg>
                                <p class="mb-2 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold">Click to upload resumes</span> or drag and drop</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">PNG, JPG , JPEG, PDF, DOCX (MAX. 800x400px)</p>
                            </div>
                            <input id="dropzone-file" type="file" multiple onChange={handleFileChange} class="hidden" />
                        </label>
                    </div> 
                    <div className='mt-4 flex justify-end mr-2'>
                        <div>
                            <button className='border text-white px-8 py-2 rounded-[50px] hover:bg-white hover:text-black' onClick={handleNext}>Next</button>
                        </div>
                    </div>
                </div>
            </>
            :
            <>
                <h1 className='text-[32px] uppercase font-bold ml-24 mt-5'>Upload Job Description</h1>
                <div className='px-48 py-16'> 
                <div class="flex items-center justify-center w-full">
                    <label for="dropzone-file" class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                        <div class="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg class="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                            </svg>
                            <p class="mb-2 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold">Click to upload Job description</span> or drag and drop</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400">PNG, JPG , JPEG, PDF, DOCX (MAX. 800x400px)</p>
                        </div>
                        <input id="dropzone-file" type="file"  onChange={handleUploadJD} class="hidden" />
                    </label>
                </div> 
                <div className='mt-4 flex justify-end mr-2'>
                    <div>
                        <button className='border text-white px-8 py-2 rounded-[50px] hover:bg-white hover:text-black' onClick={handleSubmit}>Predict</button>
                    </div>
                </div>
                </div>
            </>
        }
        </>
        :
        <>
         <div className='px-32 py-12  grid grid-cols-2 gap-4'>
                <div className=' border flex flex-col items-center'>
                    <div><h1 className='text-[32px] uppercase font-bold mt-4'>RESULT</h1></div>
                    <div><p>{results.length}/{files.length} - resume completed</p></div>
                    <div className='mt-4 mb-5 px-10 w-full'>
                        <div className='border'>
                            <div class="relative overflow-x-auto">
                                <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                    <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                        <tr>
                                            <th scope="col" class="px-6 py-3">
                                                Name
                                            </th>
                                            <th scope="col" class="px-6 py-3">
                                                Score
                                            </th>
                                            
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.map((result, index) => (
                                            <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                    {result.id}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {result.score}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='border flex flex-col justify-center items-center  py-5'>
                    <div><h1 className='text-[32px] uppercase font-bold '>Upload Excel Sheet</h1></div>
                    <div className='mt-4'>
                        <label for="dropzone-file" class="px-5 py-3 flex  flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                            <div class="flex flex-col items-center justify-center pt-5 pb-6">
                                <svg class="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                                </svg>
                                <p class="mb-2 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold">Click to upload Excel</span> or drag and drop</p>
                            </div>
                            <input id="dropzone-file" type="file"  onChange={handleExcel} class="hidden" />
                        </label>
                    </div>
                    <div className='mt-4 border h-8 rounded-[50px]'>
                        <label className='mr-2 px-4' htmlFor="count">COUNT</label>
                        <input className='h-full rounded-r-[50px] text-black pl-3' onChange={handleExcelCount} type="number" name='count'/>
                    </div>
                    <div>
                        <button className='border mt-4  text-white px-8 py-2 rounded-[50px] hover:bg-white hover:text-black' onClick={sendTestLink}>Send Test Link</button>
                    </div>
                </div>
         </div>
        </>
        }
       
        <Footer/>
    </div>
  )
}



export default predict;