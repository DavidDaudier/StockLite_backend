import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ReceivedSheetConfigService } from './received-sheet-config.service';
import { CreateReceivedSheetConfigDto } from './dto/create-received-sheet-config.dto';
import { UpdateReceivedSheetConfigDto } from './dto/update-received-sheet-config.dto';

@Controller('received-sheet-config')
export class ReceivedSheetConfigController {
  constructor(
    private readonly receivedSheetConfigService: ReceivedSheetConfigService,
  ) {}

  @Post()
  create(@Body() createDto: CreateReceivedSheetConfigDto) {
    return this.receivedSheetConfigService.create(createDto);
  }

  @Get()
  findAll() {
    return this.receivedSheetConfigService.findAll();
  }

  // Endpoint spécial pour récupérer la config active
  @Get('active')
  findActive() {
    return this.receivedSheetConfigService.findActive();
  }

  // Endpoint spécial pour mettre à jour la config active
  @Patch('active')
  updateActive(@Body() updateDto: UpdateReceivedSheetConfigDto) {
    return this.receivedSheetConfigService.updateActive(updateDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.receivedSheetConfigService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateReceivedSheetConfigDto,
  ) {
    return this.receivedSheetConfigService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.receivedSheetConfigService.remove(id);
  }
}
