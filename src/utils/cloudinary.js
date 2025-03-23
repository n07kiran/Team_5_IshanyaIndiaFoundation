import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
import { FileMapping } from "../models/FileMapping.js"

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) =>{
    try{
        if(!fs.existsSync(localFilePath)){
            console.log("Local file does not exists 'uploadOnCloudinary' func ");
            return null
        }

        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })

        console.log("File uploaded successfully !")
        console.log("Public Url : ",response.url)

        //save the file mapping to the database
        const fileMapping = new FileMapping({
            publicUrl: response.url,
            localFilePath: localFilePath,
            publicId: response.public_id
        })
        await fileMapping.save()
        fs.unlinkSync(localFilePath)
        return response
    }catch(error){
        fs.unlinkSync(localFilePath); // shouldn't we retry uploading : Doubt ??
        return null;
    }
}

// const extractPublicId = (urlString) => {
//     const splitURL = urlString.split("/")

//     const fileName = splitURL.pop().split('.')[0]
    
//     const regex = /v[0-9]+/
//     const folderName = splitURL.pop()
    
//     if(folderName.match(regex))
//     {
//       return fileName
//     }
    
//     return folderName + '/' + fileName
// };

const extractPublicId = async (urlString) => {
    const fileMapping = await FileMapping.findOne({publicUrl: urlString})
    return fileMapping.publicId
}

const deleteOnCloudinary = async(publicUrl) =>{
    // ex : http://res.cloudinary.com/kiranchaicloud/image/upload/v1729049814/imnx2xjqmg3rsxzgmvxt.jpg
    // ex : https://res.cloudinary.com/kiranchaicloud/image/upload/v1728780939/samples/woman-on-a-football-field.jpg

    const publicId = extractPublicId(publicUrl)

    console.log({publicUrl , publicId})

    const response = await cloudinary.uploader.destroy(publicId, {resource_type:"auto"})
    
    console.log(response)  // { result: 'not found' } , { result: 'ok' }

    if(response.result === "ok"){
        await FileMapping.deleteOne({publicUrl: publicUrl})
        return true
    }
    else{
        console.log("File not found")
        return false
    }
}

export {uploadOnCloudinary,deleteOnCloudinary}